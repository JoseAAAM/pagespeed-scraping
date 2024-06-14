import puppeteer from 'puppeteer'

const headless = true

async function automacao(categoryPath: string) {
  const browser = await puppeteer.launch({ headless })
  const page = await browser.newPage()

  try {
    const url =
      'https://pagespeed.web.dev/'
    await page.goto(url)

    const input = 'input[placeholder="Enter a web page URL"]'

    const form = await page.$('.TbIHAd');

    if (form) {
      await page.type(input, categoryPath)

      await form.evaluate(form => (form as HTMLFormElement).submit());

      await page.waitForSelector('.lh-gauge__percentage', {
        timeout: 5 * 60000
      })
    } else {
      console.log('Nenhum formulário encontrado com a classe .TbIHAd.');
    }

    const elementos = await page.$$('.lh-gauge__percentage');

    if (elementos.length > 0) {
      const firstGauge = elementos[0];
      const performanceGrade = await page.evaluate(elemento => elemento.textContent, firstGauge);
      console.log(`${performanceGrade} ${categoryPath}`,);
      return performanceGrade
    } else {
      console.log('Nenhum elemento encontrado com a classe lh-gauge__percentage.');
    }

  } catch (error) {
    console.error(`Ocorreu um erro: ${categoryPath}`, error)
  } finally {
    if (headless) {
      setTimeout(async () => {
        await browser.close();
      }, 3000);
    } else {
      await browser.close()
    }
  }
}

async function execute(loops: number) {
  const preview = ''

  const list: string[] = []

  const array = Array.from({ length: loops }, (v, i) => i + 1)

  let grades: { url: string, [key: string]: string | number }[] = []

  for (const index in array) {
    const i = Number(index)

    for (const link of list) {
      const grade = await automacao(link)

      if (grades.some(item => item.url === link)) {
        grades = grades.map(item => {
          if (item.url === link) {
            return { ...item, [`grade${i + 1}`]: grade ?? '' }
          }
          return item
        })
      } else {
        grades.push({ url: link, grade1: grade ?? '' })
      }
    }
  }

  grades = grades.map(item => {
    let average = 0
    let items = 0

    for(const key in item) {

      if(key.includes('grade')) {
        items = items + 1
        average = average + Number(item[key])
      }
    }

    average = average / items

    return {
      ...item,
      average: average.toFixed(2)
    }
  })

  for(const item of grades) {
    let average = 0
    let items = 0

    for(const key in item) {

      if(key.includes('grade')) {
        items = items + 1
        average = average + Number(item[key])
      }
    }

    average = average / items
  }

  console.log(grades)
}

execute(3)

