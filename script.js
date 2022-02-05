const axios = require('axios');
const cron = require('node-cron');

const loadDataFromFiles = require('./loadDataFromFiles');
require('dotenv').config();

const accessToken = process.env.TOKEN;
const vkBaseUrl = 'https://api.vk.com/method/wall.post';
const minutes = 20;

let tasksToDo = [];

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const postAnimal = async (animal, groupId) => {
  try {
    const { text, photos } = animal;
    const vkApi = `${vkBaseUrl}?owner_id=${groupId}&message=${text}&attachments=${photos.join(',')}&from_group=0&&access_token=${accessToken}&v=5.124`;
    const encodedURL = encodeURI(vkApi);
    const { data } = await axios.get(encodedURL);
    console.log(new Date().toLocaleString('ru'), data, groupId);
  } catch (err) {
    console.log('Error: ', err.message);
  }
}

const sendAllAds = async (allPosts) => {
  for await (const post of allPosts) {
    const { animal, groupId } = post;
    await postAnimal(animal, groupId);
    await sleep(1000 * 60 * minutes);
  }
};

const startMainLoop = async (animals, groups) => {
  const allPosts = [];
  for (let animal of animals) {
    for (let groupId of groups) {
      allPosts.push({ animal, groupId });
    }
  }

  while (true) {
    console.log('\n=== START NEW DAY LOOP ===\n');
    await sendAllAds(allPosts);
  }
};

const startSecondLoop = async (animals, privateGroups) => {
  let i = 0;
  function myLoop() {
    setTimeout(function () {
      const animalPair = [animals[i]];
      if (i !== animals.length - 1) {
        animalPair.push(animals[i + 1]);
        i++;
      } else {
        i = 0;
        animalPair.push(animals[i]);
      }
      if (i === animals.length - 1) {
        i = -1;
      }
      i++;
      if (i < animals.length) {
        myLoop();
      }

      animalPair.forEach((animal) => {
        privateGroups.forEach((groupId) => {
          tasksToDo.push({ animal, groupId });
        });
      });

      console.log('\n --- push new posts --- length:', tasksToDo.length, '\n');
    }, 1000 * 60 * 60 * 24 * 4);
  }

  console.log('\n=== start pushing loop, actual length:', tasksToDo.length);
  myLoop();
};

const main = async () => {
  const { animals, groups, privateGroups } = await loadDataFromFiles();
  startMainLoop(animals, groups);
  startSecondLoop(animals, privateGroups);
};

// every 2 hours and 10 minutes
cron.schedule('10 */2 * * *', async () => {
  if (tasksToDo.length === 0) return;
  const { animal, groupId } = tasksToDo.shift();
  try {
    console.log('CRON --- ', new Date().toLocaleString('ru'));
    await postAnimal(animal, groupId);
  } catch (err) {
    console.log('Error:', err);
  }
});

main();