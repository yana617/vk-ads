const axios = require('axios');

const loadDataFromFiles = require('./loadDataFromFiles');
require('dotenv').config();

const accessToken = process.env.TOKEN;
const vkBaseUrl = 'https://api.vk.com/method/wall.post';

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const main = async () => {
  const { text, photos, groups } = await loadDataFromFiles();

  for await (const groupId of groups) {
    try {
      const vkApi = `${vkBaseUrl}?owner_id=${groupId}&message=${text}&attachments=${photos.join(',')}&from_group=0&&access_token=${accessToken}&v=5.124`;
      const encodedURL = encodeURI(vkApi);
      const { data } = await axios.get(encodedURL);
      console.log(new Date().toLocaleString(), data.response, groupId);
      await sleep(1000 * 60 * 60);
    } catch (err) {
      console.log('Error: ', err.message);
    }
  }
};

main();