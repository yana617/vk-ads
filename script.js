const axios = require('axios');

const loadDataFromFiles = require('./loadDataFromFiles');
require('dotenv').config();

const accessToken = process.env.TOKEN;
const vkBaseUrl = 'https://api.vk.com/method/wall.post';
const minutes = 0.001;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const postAnimal = async (animal, groupId) => {
  const { text, photos } = animal; 
  const vkApi = `${vkBaseUrl}?owner_id=${groupId}&message=${text}&attachments=${photos.join(',')}&from_group=0&&access_token=${accessToken}&v=5.124`;
  const encodedURL = encodeURI(vkApi);
  const { data } = await axios.get(encodedURL);
  console.log(new Date().toLocaleString('ru'), data.response, groupId);
}

const sendAllAds = async (allPosts) => {
  for await (const post of allPosts) {
    try {
      const { animal, groupId } = post;
      await postAnimal(animal, groupId);
      await sleep(1000 * 60 * minutes);
    } catch (err) {
      console.log('Error: ', err.message);
    }
  }
};

const main = async () => {
  const { animals, groups } = await loadDataFromFiles();

  const allPosts = [];
  for (let groupId of groups) {
    for (let animal of animals) {
      allPosts.push({ animal, groupId });
    }
  }

  while (true) {
    console.log('\n=== START NEW DAY LOOP ===\n');
    await sendAllAds(allPosts);
  }
};

main();