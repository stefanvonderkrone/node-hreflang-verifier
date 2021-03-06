const fs = require('fs');
const { promisify } = require('util');
const argv = require('yargs').alias('i', 'in').argv;

const input = argv.in;

const _readFile = promisify(fs.readFile);
const readFile = async (...args) => _readFile(...args);

/**
 *
 * @async
 * @param {String} url
 *
 * @returns {Promise.<{url: String, content: String}>}
 */
const loadUrl = async url => ({
  url,
  content: '',
});

/**
 *
 * @async
 * @param {String[]} urls
 *
 * @returns {Promise.<Array.<{url:String, content: String}>>}
 */
const loadUrls = async urls => Promise.all(urls.map(loadUrl));

/**
 *
 * @param {{url: String, content: String}} $0
 * @returns {{url: String, hreflangs: Object}}
 */
const parseUrlContent = ({ url, content }) => ({
  url,
  hreflangs: {
    'de-DE': 'foo' + Math.random(),
    'en-EN': 'bar',
  },
});

/**
 *
 * @param {Object} o1
 * @param {Object} o2
 *
 * @returns {Boolean}
 */
const objEquals = (o1, o2) => JSON.stringify(o1) === JSON.stringify(o2);

/**
 *
 * @param {Array.<{url: String, hreflangs: Object}>} $0
 *
 * @returns {{previous: {url: String, hreflangs: Object}, completed: Array.<{url: String, hreflangs: Object, verified: Boolean}>}}
 */
const verifyContents = ([head, ...rest]) =>
  rest.reduce(
    ({ previous, completed }, current) => {
      const { url: previousUrl, hreflangs: previousHrefLangs } = previous;
      const { url: currentUrl, hreflangs: currentHrefLangs } = current;
      return {
        previous: current,
        completed: [
          ...completed,
          {
            ...current,
            verified: objEquals(previousHrefLangs, currentHrefLangs),
          },
        ],
      };
    },
    {
      previous: head,
      completed: [],
    }
  );

const main = async () => {
  const contents = await readFile(input, { encoding: 'utf-8' });
  const urls = contents.split('\n');
  const urlContents = await loadUrls(urls);
  const parsedContents = urlContents.map(parseUrlContent);
  const { completed } = verifyContents(parsedContents);
  const falsehoods = completed.filter(({ verified }) => !verified);
  console.log(falsehoods.map(({ url }) => url).join('\n'));
};

main();
