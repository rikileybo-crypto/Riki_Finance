import { createScraper, CompanyTypes } from 'israeli-bank-scrapers';

const COMPANY_MAP = {
  leumi: CompanyTypes.Leumi,
  max: CompanyTypes.Max,
};

export async function scrapeAccount(accountType, credentials, startDate) {
  const companyId = COMPANY_MAP[accountType];
  if (!companyId) throw new Error(`Unsupported type: ${accountType}`);

  const scraper = createScraper({
    companyId,
    startDate: startDate || new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    showBrowser: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const result = await scraper.scrape(credentials);
  if (!result.success) throw new Error(result.errorMessage || 'Scraping failed');
  return result.accounts || [];
}
