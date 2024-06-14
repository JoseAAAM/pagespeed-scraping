import puppeteer, { Browser, Page } from 'puppeteer';

const headless = true;

async function launchBrowser(): Promise<Browser> {
  return puppeteer.launch({ headless });
}

async function openPage(browser: Browser): Promise<Page> {
  return browser.newPage();
}

async function navigateToUrl(page: Page, url: string): Promise<void> {
  await page.goto(url);
}

const gradeGaugeSelector = '.lh-gauge__percentage'

async function submitForm(page: Page, categoryPath: string): Promise<void> {
  const inputSelector = 'input[placeholder="Enter a web page URL"]';
  const formSelector = '.TbIHAd';

  const form = await page.$(formSelector);

  if (form) {
    await page.type(inputSelector, categoryPath);
    await form.evaluate((form) => (form as HTMLFormElement).submit());
    await page.waitForSelector(gradeGaugeSelector, {
      timeout: 5 * 60000
    });
  } else {
    console.log('Nenhum formulário encontrado com a classe .TbIHAd.');
    return;
  }
}

async function extractPerformanceGrade(page: Page): Promise<string | null> {
  const elementos = await page.$$(gradeGaugeSelector);

  if (elementos.length > 0) {
    const firstGauge = elementos[0];
    const performanceGrade = await page.evaluate(elemento => elemento.textContent, firstGauge);
    return performanceGrade;
  } else {
    console.log('Nenhum elemento encontrado com a classe lh-gauge__percentage.');
    return null;
  }
}

async function automacao(browser: Browser, categoryPath: string): Promise<string | null> {
  const page = await openPage(browser);

  try {
    await navigateToUrl(page, 'https://pagespeed.web.dev/');
    await submitForm(page, categoryPath);

    const performanceGrade = await extractPerformanceGrade(page);
    console.log(`${performanceGrade} ${categoryPath}`);
    return performanceGrade;
  } catch (error) {
    console.error(`Ocorreu um erro: ${categoryPath}`, error);
    return null;
  } finally {
    if (headless) {
      await page.close();
    } else {
      setTimeout(async () => {
        await page.close();
      }, 5000)
    }
  }
}

interface Grade {
  url: string;
  [key: string]: string | number;
}

async function execute(loops: number): Promise<void> {
  const preview = '';

  const list: string[] = [];

  const browser = await launchBrowser();
  const grades: Grade[] = [];

  for (let i = 0; i < loops; i++) {
    for (const link of list) {
      const grade = await automacao(browser, link);

      let gradeItem = grades.find(item => item.url === link);
      if (gradeItem) {
        gradeItem[`grade${i + 1}`] = grade || '';
      } else {
        gradeItem = { url: link, [`grade${i + 1}`]: grade || '' };
        grades.push(gradeItem);
      }
    }
  }

  for (const item of grades) {
    const gradeKeys = Object.keys(item).filter(key => key.includes('grade'));
    const average = gradeKeys.reduce((sum, key) => sum + Number(item[key]), 0) / gradeKeys.length;
    item.average = average.toFixed(2);
  }

  await browser.close();
  console.log(grades);
}

execute(3);
