import { VK, Keyboard } from "vk-io";
import { MongoClient } from "mongodb";
import fs from 'fs';
import { Console } from "console";
// Переменные
let k = 0
let timeFish = 300;
let now = new Date();
let nowDate = Date().getDateсв
const cfg = JSON.parse(fs.readFileSync('./config.json'));
const vk = new VK({
  token: cfg.token
});
const client = new MongoClient('mongodb://127.0.0.1:27017');
const db = client.db('fish').collection('users');
let currentDate = new Date();
let day = ("0" + currentDate.getDate()).slice(-2);
let month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
let year = currentDate.getFullYear();
let hours = ("0" + currentDate.getHours()).slice(-2);
let minutes = ("0" + currentDate.getMinutes()).slice(-2);
let seconds = ("0" + currentDate.getSeconds()).slice(-2);
let newDay = ""
//МАССИВЫ_____________________________________________________________________________________________
const fish = ['Порванный сапог', 'Карась', 'Окунь', 'Плотва', 'Краснопёрка', 'Щука','Язь', "Налим", "Лещ", "", 'Кувшинка', 'Спрут', 'Рыба Фугу', 'Малёк'];
const weightMax = [0.500, 1.000, 2.000, 3.000, 7.200, 10.000]
const weightMin = [0.123, 0.400, 0.800, 1.600, 2.200]
const phrases = ["Все новости бота можно посмтореть в сообществе!", "Улучшить удочку можно командой '.улучшить удочку'", "Улучшить локацию можно командой '.улучшить локацию'", "Рыбалка – это как жизнь: нужно терпение и умение ждать", "Лучше один раз поймать большую рыбу, чем сто раз мелкую", "Рыбаку везет, когда он сам себе удочку кидает", "Рыбалка – это искусство находить общий язык с природой", "Удочка в руках – душа в радости", "На рыбалке лучше всех отдыхают те, кто умеет ждать", "Рыбаку все рыбки к обеду", "Рыбалка – это способ подзарядиться позитивной энергией", "Рыбаку важно не только поймать рыбу, но и насладиться процессом ловли", "Там, где вода, там и рыба", "Удочка – лучший друг рыбака", "Лови рыбу, как будто завтра конца света", "Рыбалка – это возможность уйти от повседневных забот и насладиться природой", "Кто ищет, тот всегда найдет рыбку", "На рыбалке время течет медленнее, чем в городе", "Поймай рыбу – и твой день будет удачным", "Рыбалка – это способ научиться быть терпеливым и настойчивым", "Лучше на рыбалку, чем в бар за пятьдесят километров", "Рыбаку важно быть в гармонии с природой, чтобы поймать большую рыбу", "На рыбалке нет плохой погоды, есть только плохая экипировка", "Лови рыбу с улыбкой на лице – и она точно попадется", "Рыбалка – это возможность побывать в мире без стресса и суеты", "Лучше один раз поймать большую рыбу, чем много мелких", "Рыбаку важно быть внимательным и чутким к окружающей природе", "На рыбалке каждый может стать хорошим рыбаком, если у него есть терпение и настойчивость", "Лови рыбу с умом и она обязательно попадется на крючок", "Рыбалка – это возможность провести время с семьей или друзьями и насладиться общением"]
//______________________________________________________НАЧАЛО___________________________________________
//стартовая отладка
vk.updates.start().then(() => {
  console.log('\x1b[35m%s\x1b[0m',`Бот Запущен  ${day}.${month}.${year} ${hours}:${minutes}:${seconds}`);
//Проверка на сообщения
vk.updates.on('message', async (context, next) => {
  if (context.isGroup) return;
  let currentDate = new Date();
  let day = ("0" + currentDate.getDate()).slice(-2);
  let year = currentDate.getFullYear();
  let hours = ("0" + currentDate.getHours()).slice(-2);
  let minutes = ("0" + currentDate.getMinutes()).slice(-2);
  let seconds = ("0" + currentDate.getSeconds()).slice(-2);
  try {
    phrases.push(context.text) //Добавление всех сообщений в массив. Сохранение
    await client.connect();
    const phrasesPlayers = await db.findOne();
    let user_info = await vk.api.users.get({ user_ids: context.senderId });//Данные о пользователе
    const result = await db.findOne({id: context.senderId}); 
    if(context.text == null){
      k+=1
      if(k>5){
        await context.send( "Крутой стикер!!!" )
        k=0
      }
    }
    else{
      await db.updateOne({phrasesPlayers: phrasesPlayers.phrasesPlayers}, { $push: { phrasesPlayers: '[id'+ context.senderId + '|' + user_info[0].first_name +" " + user_info[0].last_name + '] - ' + context.text} });
      console.log(`${user_info[0].last_name} пишет: 
${day}.${month}.${year}  ${hours}:${minutes}:${seconds}
${context.text}
____________________________________________`)
    }
    if (result === null ) {//Регистрация Пользователя
      await db.insertOne({ 
         "id": context.senderId, "balance_real": 0,
         "balance_fake": 0,
         "PlayerFishes": 0,
         "attempsCheck": 0, 
         "attemps":10,
         "kd": 0,
         "weight": 0 ,
         "lastName": user_info[0].last_name,
         "firstName": user_info[0].first_name,
         "FishingRodLevel": 1,
         "FishingLocationLevel": 1,
         "FishingHookLevel":1,
         "PlayerMaxSellLocal": 0,
         "PlayerMaxWeightLocal":0,
         "torn_boots":0,
         "stats": { "new": 1, "fish": 0 } 
              });
    }
  }
   catch (err) {
    //await context.reply("Подгрузка информации...");
    console.log(err);
  } finally {
    await client.close();
  }
  await next();
})
//Обновление баз данных (Для разработчика)
vk.updates.hear('.рыб обновить бд', async(context)=> {
  try{
    const client = new MongoClient(`mongodb://127.0.0.1:27017`);
    await client.connect()//подключение
    const db = client.db('fish');
    const collection = db.collection('users');
    //await collection.updateMany({}, {$set: {attempsCheck: 1}});
  //  await collection.updateMany({}, {$set: {attemps: 10}});  
    await context.send('Данные успешно обновлены!')

   await collection.updateMany({}, {$set: {attempsCheck: 1}});
  }
finally{
  await client.close()
}}) 
vk.updates.hear('.бизнес', async(context)=> {
  try{
    await context.send(`
    　.　　. 　 ˚　.　　　　　 . ✦　　　 　˚　　　　 . ★⋆.
    　　　.   　　˚　　 　　*　　 　　✦
    　　.　　. 　 ˚　.　　　　　 . ✦　　　 　˚　　　　 . ★⋆.
    　　　.   　　˚　　 　　*`)

   // await collection.updateMany({}, {$set: {FishingLocationLevel: 1}});
  }
finally{
}}) 
vk.updates.hear('.рыб отключить', async(context)=> {
  try{
    if(context.senderId == 509217661){
      await context.send("Бот был выключен")
      process.exit();
    }
    else{
      await context.send("У вас недостаточно полномочий!")
    }
  }
finally{
}}) 
//Рыбий Топ
vk.updates.hear('.рыб топ', async(context)=> {
  try{
    const top = []
    const client = new MongoClient(`mongodb://127.0.0.1:27017`);
    await client.connect()//подключение
    const db = client.db('fish');
    const collection = db.collection('users');
    collection.find().sort({ balance_real: -1 }).limit(10).toArray()//Поиск пользователей
    .then(users => {
       users.forEach((user, index) => {
       top.push(`\n${index + 1}. [id${user.id}| ${user.firstName} ${user.lastName}] - ${user.balance_real} монет`);//Добаволение
      }
      );
      context.send(`${top}`,  {disable_mentions: 1});
    })
    .catch(err => {  
      console.error('Ошибка при поиске пользователей:', err);
    });
  }
  catch (err) {
    await context.reply("Ошибка №2. Свяжитесь с администрацией");
    console.log(err);
  }
  finally {
    await client.close();
   }
})
}); 
//Улучшение удочки
vk.updates.hear('.улучшить удочку', async (context) => {
  try{
    await client.connect()//подключение
    const result = await db.findOne({id: context.senderId});
    const all = await db.findOne();
    if(result.FishingRodLevel == 1){
      if(result.balance_real >= 20000){
        await context.send(`Вы улучшили удочку до уровня "Удочка из Китая"`)
        await db.updateOne({ id: context.senderId }, { $set: { "FishingRodLevel": 2} });
        await db.updateOne({ id: context.senderId }, { $inc: { "balance_real": -20000} });
        console.log('Пользователь улучшил удочку')
      }
      else{
        await context.send(`Вам не хватает ${20000-result.balance_real} монет!`)
      }
    }
    else if(result.FishingRodLevel == 2){
      if(result.balance_real >= 50000){
        await context.send(`Вы улучшили удочку до уровня "Любительская удочка"`)
        await db.updateOne({ id: context.senderId }, { $set: { "FishingRodLevel": 3} });
        await db.updateOne({ id: context.senderId }, { $inc: { "balance_real": -50000} });
        console.log('Пользователь улучшил удочку')
      }
      else{
        await context.send(`Вам не хватает ${50000-result.balance_real} монет!`)
      }
    }
    else {
      await context.send(`У вас максимальный уровень удочки!`)
    }
  }
  catch (err) {
    await context.reply("Ошибка №3. Свяжитесь с администрацией");
    console.log(err);
  }
  finally{
    await client.close
  }
})
//Улучшение локации
vk.updates.hear('.улучшить локацию', async (context) => {
  try{
    await client.connect()//подключение
    const result = await db.findOne({id: context.senderId});
    const all = await db.findOne();
    if(result.FishingLocationLevel == 1){
      if(result.balance_real >= 5000){
        await context.send(`Вы улучшили локацию до уровня "Деревенское озеро"`)
        await db.updateOne({ id: context.senderId }, { $set: { "FishingLocationLevel": 2} });
        await db.updateOne({ id: context.senderId }, { $inc: { "balance_real": -5000} });
        console.log('Пользователь улучшил локацию')
      }
      else{
        await context.send(`Вам не хватает ${5000-result.balance_real} монет!`)
      }
    }
    else {
      await context.send(`У вас максимальный уровень локации`)
    }
  }
  catch (err) {
    await context.reply("Ошибка №3. Свяжитесь с администрацией");
    console.log(err);
  }
  finally{
    await client.close
  }
})
//ОБЩАЯ СТАТИСТИКА
vk.updates.hear('.другое', async (context) => {
  try {
    await client.connect()//подключение
    const result = await db.findOne({id: context.senderId});
    const all = await db.findOne();
    const countPhrases = all.phrasesPlayers.length
    let localFishName
    let localLocateName
    if(result.FishingRodLevel == 1){
    localFishName = "Бамбук с ниткой"
    }
    else if(result.FishingRodLevel == 2){
    localFishName = "Удочка из Китая"
    }
    else if(result.FishingRodLevel == 3){
      localFishName = "Любительская удочка"
      }
    else{
    localFishName = "Ошибка, свяжитесь с админом"
    }
    if(result.FishingLocationLevel == 1){
      localLocateName = 'Болото с карасями'
    }
    else if (result.FishingLocationLevel){
    localLocateName = 'Деревенское озеро'
    }
await context.send(`
Всего игроками было выловлено ${all.count} рыбов!
Рекорд веса пойманной рыбы: ${all.PlayerMaxWeight} кг.
Самая дорогая рыба: ${all.PlayerMaxSell} монет
-
Ваша статистика:
Уровень удочки: ${localFishName}
Уровень локации: ${localLocateName}
Рыб поймано: ${result.PlayerFishes}
Неудачных уловов: ${result.torn_boots}
Ваш самый тяжёлый улов: ${result.PlayerMaxWeightLocal} кг
Ваша самая дорогая рыба: ${result.PlayerMaxSellLocal} монет
Наживки осталось: ${result.attemps}
-
Как говорил ${all.phrasesPlayers[ Math.floor(Math.random() * countPhrases) + 1]}`,  {disable_mentions: 1})

} 
catch (err) {
  await context.reply("Ошибка №4. Свяжитесь с администрацией");
  console.log(err);
}
finally {
  await client.close();
}
});
//Помощь по командам
vk.updates.hear('.рыб помощь', async (context) => {
  const message = await context.send(`
  Помощь по командам:\n
  ".рыбалка" - начать рыбалку. - длительность 5 минут
  ".баланс" - просмотр баланса, остатка наживки
  ".продать улов" - продажа рыбы за монеты
  ".рыб топ" - глобальный топ 10 по количеству монет
  ".кнопки" - добавить кнопки (Используйте только в личных сообщениях с сообществом)
  ".убрать кнопки" - убрать кнопки  
  ".другое" - просмотр разных статистических данных
  `);
console.log('ID сообщения бота:', message); // Вывод ID сообщения бота в консоль
});
//Продажа улова
vk.updates.hear('.продать улов', async (context) => {
  try {
  await client.connect()//подключение
  const result = await db.findOne({id: context.senderId});
  await db.updateOne({ id: context.senderId }, { $inc: { "balance_real": result.balance_fake} });
  if(result.balance_fake>0){
      await context.send(`Вы продали свою рыбу за ${result.balance_fake} монет!`)
      await db.updateOne({ id: context.senderId }, { $set: { "balance_fake": 0 } }); 
    }
    else{
      await context.send(`К сожалению,   вам нечего продавать!`)
    }
   } 
   catch (err) {
    await context.reply("Ошибка №5. Свяжитесь с администрацией\n Проверьте начислились ли монеты на основной баланс");
    console.log(err);
  }
   finally {
      await client.close();
   }
});
//Просмотр баланса
vk.updates.hear('.баланс', async (context) => {
  try {
    await client.connect()
    const result =  await db.findOne({id: context.senderId});
    await context.send(`Ваш баланс ${result.balance_real} монет\n-\nКоличество оставшейся наживки: ${result.attemps}  `)
   } 
   finally {
    await client.close();
   }
});
//кнопки
vk.updates.hear('.кнопки', (context) => {
  context.send({
  message:"Кнопки были добавлены",
  keyboard: Keyboard.builder()
    .textButton({
      label: '.рыбалка',
      color: Keyboard.POSITIVE_COLOR,
    })
    .row()
    .textButton({
      label: '.продать улов',
      color: Keyboard.NEGATIVE_COLOR,
    })
    .textButton({
      label: '.баланс',
      color: Keyboard.NEGATIVE_COLOR,
    })
    .textButton({
      label: '.другое',
      color: Keyboard.NEGATIVE_COLOR,
    })
    .row()
    .textButton({
      label:".убрать кнопки",
      color: Keyboard.NEGATIVE_COLOR,
     })
  });
});
//Исключение кнопок
vk.updates.hear('.убрать кнопки', (context) => {
  context.send({
    message:"Кнопки были убраны",
   keyboard:Keyboard.builder()
  });
});
//БАЗА РЫБАЛКИ
//------------------------------------------------------------------------
vk.updates.hear('.рыбалка', async (context) => {
  let result;
  try {
    let user_info = await vk.api.users.get({ user_ids: context.senderId });//Получений Информаций о пользователе
    await client.connect();
    result = await db.findOne({ id: context.senderId });
    await db.updateOne({ id:context.senderId}, {$set:{"firstName": user_info[0].first_name}})//Обновление информации о пользователе в базе данных
    await db.updateOne({ id:context.senderId}, {$set:{"lastName": user_info[0].last_name}})
    if(result.stats.new == 1){//Проверка на первую игру
      let NewPlayerId = context.senderId
      user_info = await vk.api.users.get({ user_ids: context.senderId });
      context.send(`[id${NewPlayerId}|${user_info[0].first_name}] Добро пожаловать в бот рыбалка! Версия бота 0.1.1 beta. Вы были успешно зарегистрированны\n`, {disable_mentions: 1})//ПРОВЕРКА НА НОВОГО ПОЛЬЗОВАТЕЛЯ
      await db.updateOne({ id: context.senderId }, { $set: { "stats.new": 0 } }); 
    }
    if(result.attempsCheck > 1){//На всякий случай
      await db.updateOne({ id:context.senderId}, {$set:{"attempsCheck": 1}})
    }
    if(result.attempsCheck==1){//Проверка на первую игру в день
      await db.updateOne({ id: context.senderId }, { $set: { "attemps": 10} });
      await db.updateOne({ id:context.senderId}, {$set:{"attempsCheck": 0}})
      newDay = "-\nНовый день - новая рыбка! \nТы получил 10 червячков для шикарной рыбалки!"
     
    }
    let date = Math.floor(Date.now() / 1000);//Дата
    if(result.attemps>0){
      if (date - result.kd >= timeFish/* КД на рыбалку */) {
        console.log(`\x1b[36m%s\x1b[0m`, `${user_info[0].last_name} ${user_info[0].first_name} Начал рыбалку`)
        try {
          await client.connect();
          const b = await db.findOne();
          await db.updateOne({ id: context.senderId }, { $set: { "kd": date } });
          await db.updateOne({ id: context.senderId }, { $set: { "weight": 0 } });
          await db.updateOne({ id: context.senderId }, { $inc: { "attemps": -1} });
          if(result.attemps<0){
            await db.updateOne({ id: context.senderId }, { $set: { "attemps": 0} });
          }
          await context.send(`[🎣] Вы начали рыбалку\nПомните: ${phrases[ Math.floor(Math.random() * 30) + 1]}\n ${newDay}`);
          newDay = ""
          setTimeout(async () => {
                      try {
                        await client.connect()
                        const b = await db.findOne();
                        await db.updateOne({count: b.count}, { $inc: { count: 1 } });
                      } 
                       finally {
                       await client.close();
                       }
            const fish = getFish(result.FishingLocationLevel);
            const weightMax = getMass(result.FishingRodLevel);
            const weightMin = getMinMass(result.FishingRodLevel)
           // console.log(weightMax, weightMin)
            if (fish == 'Порванный сапог') {
                result.weight = 0;
                await client.connect();
                await db.updateOne({ id: context.senderId }, { $inc: { "torn_boots": 1} });
                result = await db.findOne({ id: context.senderId });
                const main = result.id
                await context.send(`[🐟] [id${main}|${result.firstName}]. Ваша рыба сорвалась! Может быть, в следующий раз повезёт!`);;
            }
            else{
              await client.connect();
              await db.updateOne({ id: context.senderId }, { $inc: { "PlayerFishes": 1} });
              result = await db.findOne({ id: context.senderId });
              result.weight = Math.random() * (weightMax - weightMin) + weightMin;
              result.weight = Math.round(result.weight * 1000) / 1000;
              const resultFirstSumm = Number(sellets(result.weight, fish));
              await client.connect();
              const main = result.id
              const stats = await db.findOne({ id: context.senderId });
              await db.updateOne({ id: context.senderId }, { $inc: { "balance_fake": resultFirstSumm} });
              console.log(`\x1b[36m%s\x1b[0m`, "Рыба была поймана! Её данные:",result.weight, resultFirstSumm)
              await context.send(`[🐟] [id${main}|${result.firstName}], Ваш улов:\n${fish} весом ${result.weight} кг.\nЕго цена ${resultFirstSumm} монет`, {});;
              if(result.weight > b.PlayerMaxWeight){
                await db.updateOne({PlayerMaxWeight: b.PlayerMaxWeight}, { $set: { PlayerMaxWeight: result.weight } });
              }
              if(resultFirstSumm > b.PlayerMaxSell){
                await db.updateOne({PlayerMaxSell: b.PlayerMaxSell}, { $set: { PlayerMaxSell: resultFirstSumm } });
              }
              if(result.weight > stats.PlayerMaxWeightLocal){
                await db.updateOne({id: context.senderId}, { $set: { PlayerMaxWeightLocal: result.weight } });
              }
              if(resultFirstSumm > stats.PlayerMaxSellLocal){
                await db.updateOne({id: context.senderId}, { $set: { PlayerMaxSellLocal: resultFirstSumm } });
              }
            }
          }, timeFish*1000 - 250)
        } finally {
          await client.close();
        }
      } else {
        await context.send(`Рано стартуешь, жди ещё примерно ${Math.round((timeFish- (date - result.kd))/60)} минут`);
      } 
    }
    else{  
      await context.send(`У вас нет наживки`)
    }
    
  } catch (err) {
    console.log(err);
    await context.send("Ошибка в рыбалке! \n Если не проводятся технические работы, сообщите администратору")
  } finally {
    await client.close();
  }
});
//________________Функции_____________________________________________________________________________
//ШАНСЫ ВЫПАДЕНИЯ РЫБЫ
function getFish(FishingLocal) {

  const randomNumber = Math.floor(Math.random() * 100) + 1;

  if(FishingLocal == 1){//Болото
    if (randomNumber <= 75) {
    return fish[1]; // Выполняем с шансом 75% Карась
  } else {
    return fish[0]; // Выполняем с шансом 25% Порванный сапог
  }
}
  if(FishingLocal == 2){//Деревенское озеро
    if(randomNumber <= 1){
      return fish[7];  //Выаолняем с шансом 1% Налим
    } else if (randomNumber <= 3){
      return fish[6];  //Выполняем с шансом 2% Язь
    } else if (randomNumber <= 10){
      return fish[5];  //Выполняем с шансом 7% Щука
    } else if (randomNumber <= 15){
      return fish[5];  //Выполняем с шансом 5% Лещ
    } else if (randomNumber <= 23){
      return fish[4];  //Выполняем с шансом 8% Краснопёрка
    } else if (randomNumber <=30){
      return fish[3];  //Выполняем с шансом 7% Плотва
    } else if (randomNumber <= 50){
      return fish[2];  //Выполняем с шансом 20% Окунь
    } else if (randomNumber <= 75){
      return fish[1];  //Выполняем с шансом 25% Карась
    } else {
      return fish[0];   //Выпоняем с шансом 25% Порванный сапог
    }
  }
  else{
    console.log("Ошибка")
  }
}

//Минимальная масса рыбы в зависимости от уровня удочки
function getMinMass(FishingLocal){
  if(FishingLocal == 1){
    return weightMin[0]
  } else if(FishingLocal == 2){
    return weightMin[1]
  } else if(FishingLocal == 3){
    return weightMin [2]
  }
}
//ШАНСЫ ВЫПАДЕНИЯ МАССЫ РЫБЫ
function getMass(FishingLocal) {
  const randomNumberTwo = Math.floor(Math.random() * 100) + 1;
if(FishingLocal == 1){
  if (randomNumberTwo <= 0) {
    return weightMax[5] // Выполняем с шансом 0% максимальная масса 10кг
} else if (randomNumberTwo <= 3) {
    return weightMax[3] // Выполняем с шансом 3% максимальная масса 3 кг
} else if (randomNumberTwo <= 8) {
    return weightMax[2] // Выполняем с шансом 5% максимальная масса 2кг 
} else if (randomNumberTwo <= 8) {
    return weightMax[4] // Выполняем с шансом 0% максимальная масска 7.2кг
} else {
    return weightMax[0] // Выполняем с шансом 92% максимальная масса 0.5кг
}
}
else if(FishingLocal == 2){
    if (randomNumberTwo <= 2) {
      return weightMax[5] // Выполняем с шансом 2% максимальная масса 10кг
  } else if (randomNumberTwo <= 13) {
      return weightMax[3] // Выполняем с шансом 11% максимальная масса 3 кг
  } else if (randomNumberTwo <= 33) {
      return weightMax[2]//  Выполняем с шансом 20% максимальная масса 2кг 
  } else if (randomNumberTwo <= 36) {
      return weightMax[4] // Выполняем с шансом 3% максимальная масска 7.2кг
  } else {
      return weightMax[0] // Выполняем с шансом 74% максимальная масса 0.5кг
  }
}
else if(FishingLocal == 3){
  if (randomNumberTwo <= 2) {
    return weightMax[5] // Выполняем с шансом 2% максимальная масса 10кг
} else if (randomNumberTwo <= 12) {
    return weightMax[3] // Выполняем с шансом 10% максимальная масса 3 кг
} else if (randomNumberTwo <= 37) {
    return weightMax[2] // Выполняем с шансом 25% максимальная масса 2кг 
} else if (randomNumberTwo <= 40) {
    return weightMax[4] // Выполняем с шансом 4% максимальная масска 7.2кг
} else {
    return weightMax[2]  //Выполняем с шансом 60% максимальная масса 1.0кг
}
}
}
//СЧИТАЕТ ЦЕНУ ВЫЛОВЛЕННОЙ РЫБЫ
function sellets(weight1, fish) {
  let coefficient
  if (fish == 'Порванный сапог') {
      coefficient = 0.0
  } else if (fish == 'Карп-кои') {
      coefficient = 3.0
  } else if (fish == 'Окунь') {
      coefficient = 0.55
  } else if (fish == 'Щука') {
      coefficient = 1.14
  } else if (fish == 'Карась') {
      coefficient = 0.4
  } else if (fish == "Налим"){
      coefficient = 2.23
  } else if (fish == "Лещ"){
      coefficient = 1.7
  } else if (fish == "Плотва"){
    coefficient = 1.07
  } else if (fish == "Краснопёрка"){
    coefficient = 0.99
  } else if (fish == "Язь"){
    coefficient = 2.02
  }
  let firstSumm = Math.round(weight1 * coefficient * 1000);
  return firstSumm
}
const sendGreetingMessage = async () => {
  const now = new Date();
  if (now.getUTCHours() === 21 && now.getUTCMinutes() >= 0 && now.getUTCMinutes() <= 0) { // Проверка времени (00:00)   
       try {
        await client.connect();
        const db = client.db('fish');
        const collection = db.collection('users');
        await collection.updateMany({}, {$set: {attempsCheck: 1}});
        await collection.updateMany({}, {$set: {attemps: 10}});  
      } 
       finally {
       await client.close();
       }
      console.log("Попытки были начислены")
  }
};
//
//ВЫЗОВ ФУНКЦИЙ
setInterval(sendGreetingMessage, 60 * 1000); 
       /* "vk1.a._PriFVkp0TNx5JxZIAwT9ko_txEuEKxL0KOCTt2Ou1_9KeRWq1QbhIelM3ZsyujrHgC45AM06bmQzzHb328DPAJXPjcUxM5qf3imSveYlAA_nsLndGRIIhHa2WFMqWRK0da6HKy2Uynf51S8kk31-W-VS4ddiEJ9HEAQDBYF8wi5k8gIh05tC4eSmqsLeRcxdogPJevHla_mhI-qIYL5TQ" - рыбалка






       
       
       vk1.a.XNs1qmUkvhg4nrJdJUxljk-NxPWbMIANo1D713ImaQiJOIoNwfbwZzr-NzR79UyRFgVwkgsjQa0aPgBRtrtkX_i9OH1tqs6mq2sx97lT5pRRAWzvNc5u17NyzVEh92HQJXH1YBOmaFN-61VNuQNez5TGBVqYBvLKO3HgmUIIFKMrBF8iYHsiEVZdQG8oHH_nrVfzhlbTWruBqBJY5A3p1A - нтм
       */



       console.log("-")
       console.log("--")
       console.log('----')
       console.log('------')
       