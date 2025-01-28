import puppeteer from 'puppeteer';

/**
 * Example usage:
 * GET /api/scrape?firstName=Jane&lastName=Doe
 *
 * Returns JSON data from the CTC page. 
 */
export default async function handler(req, res) {
    const { firstName, lastName } = req.query;

    // Ensure we have both
    if (!firstName || !lastName) {
        return res
            .status(400)
            .json({ error: 'Please provide both "firstName" and "lastName".' });
    }

    let browser;
    try {
        // 1. Launch Puppeteer
        browser = await puppeteer.launch({
            headless: true, // set to false if you want to watch it in action
        });
        const page = await browser.newPage();

        // 2. Navigate to the CTC page
        await page.goto(
            'https://educator.ctc.ca.gov/esales_enu/start.swe?SWECmd=GotoView&SWEView=CTC+Search+View+Web',
            { waitUntil: 'networkidle2' }
        );

        // 3. Fill out the search form
        // -- IMPORTANT --
        // The actual CTC page might have separate fields for "First Name" and "Last Name"
        // or it might have a single "Name" field. 
        // You MUST inspect the site and update these selectors to the correct ones!

        // Example: If the page has a "First Name" input field with name="ctl00$MainContent$txtFirstName"
        await page.type('input[name="ctl00$MainContent$txtFirstName"]', firstName);

        // Example: If the page has a "Last Name" input field with name="ctl00$MainContent$txtLastName"
        await page.type('input[name="ctl00$MainContent$txtLastName"]', lastName);

        // Possibly there's a radio button or other elements to click before searching
        // e.g.: await page.click('input[id="rdoSearchByName"]');

        // 4. Click the Search button
        // Inspect the site to find the real ID or selector for the "Search" button.
        await Promise.all([
            page.click('input[name="ctl00$MainContent$btnSearch"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
        ]);

        // 5. Scrape the results page
        // For debugging, let's grab the entire page text:
        const data = await page.evaluate(() => {
            return document.body.innerText;
        });

        // Send the data back
        return res.status(200).json({ results: data });
    } catch (error) {
        console.error('Scraping error:', error);
        return res
            .status(500)
            .json({ error: 'Something went wrong scraping.' });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
