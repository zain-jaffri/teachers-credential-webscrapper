import puppeteer from 'puppeteer';

/**
 * API endpoint usage:
 *   GET /api/scrape?name=John+Smith
 *   GET /api/scrape?credential=123456
 *
 * Returns JSON data of whatever is scraped.
 */
export default async function handler(req, res) {
    const { name, credential } = req.query;

    // Require at least one param
    if (!name && !credential) {
        return res
            .status(400)
            .json({ error: 'Please provide either a "name" or "credential" query param.' });
    }

    let browser;
    try {
        // 1. Launch Puppeteer
        browser = await puppeteer.launch({
            headless: true, // You can set to false for debugging
        });
        const page = await browser.newPage();

        // 2. Go to the target site
        await page.goto(
            'https://educator.ctc.ca.gov/esales_enu/start.swe?SWECmd=GotoView&SWEView=CTC+Search+View+Web',
            { waitUntil: 'networkidle2' }
        );

        // 3. Fill out the search form
        //    NOTE: The site likely has multiple fields / radio buttons or more complicated steps.
        //    The code below is just an example. Inspect the site to find the correct selectors.

        // EXAMPLE SELECTORS: (These are placeholders!)
        // If name => maybe "Last Name" or a single name field:
        if (name) {
            // For demonstration, let's assume there's a single text field with name or id "txtName"
            // Adjust to the actual input.
            await page.type('input[name="ctl00$MainContent$txtName"]', name);
        }

        // If credential => maybe "Document Number"
        if (credential) {
            // For demonstration, let's assume there's a text field for "Document Number"
            // Inspect the site for the real name, id, or etc.
            await page.type('input[name="ctl00$MainContent$txtDocumentNumber"]', credential);
        }

        // Possibly you need to check or select a radio button for "Search by Document Number"
        // e.g. await page.click('input[id="rdoDocumentNumber"]');

        // 4. Click the "Search" button
        //    Again, adjust the selector to the real one on the site:
        await Promise.all([
            page.click('input[id="ctl00$MainContent$btnSearch"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
        ]);

        // 5. Parse results from the results page
        //    This is highly dependent on how the page displays data.
        //    Typically, you'd query a table or text elements.

        const data = await page.evaluate(() => {
            // For debugging, let's just return all text on the page:
            return document.body.innerText;

            // If there's a table, you might do something like:
            /*
            const rows = Array.from(document.querySelectorAll('#searchResultsTable tr'));
            return rows.map(row => {
              const cells = row.querySelectorAll('td');
              return {
                name: cells[0]?.innerText.trim(),
                credentialNumber: cells[1]?.innerText.trim(),
                status: cells[2]?.innerText.trim(),
              };
            });
            */
        });

        // Return JSON
        return res.status(200).json({ results: data });
    } catch (error) {
        console.error('Scraping error:', error);
        return res.status(500).json({ error: 'Something went wrong scraping.' });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
