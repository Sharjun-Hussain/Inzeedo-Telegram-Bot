const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const wordpressEndpoint = "https://inzeedo.com/wp-json/wp/v2/posts";
const wordpressUsername = "admin@inzeedo.com";
const wordpressPassword = "HU1w jxWt KHOl j80Z K7WZ GP8K";
const token = "6305948282:AAFJgAfof6cnNHKrXpFrB2T-Jbvx3HkSH9A";
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/create/, async (msg) => {
  try {
    // Start the conversation with the user
    bot.sendMessage(msg.chat.id, "Please enter the title of the post:");
    bot.once("message", async (titleMessage) => {
      const title = titleMessage.text;

      // Fetch categories from WordPress
      const categories = await fetchCategoriesFromWordPress();

      // Prompt the user to select a category
      bot.sendMessage(msg.chat.id, "Please select a category:", {
        reply_markup: {
          inline_keyboard: categories.map((category) => [
            {
              text: category.name,
              callback_data: JSON.stringify({ category_id: category.id }),
            },
          ]),
        },
      });

      // Wait for the user to select a category
      bot.once("callback_query", async (categoryQuery) => {
        const categoryData = JSON.parse(categoryQuery.data);
        const categoryId = categoryData.category_id;

        // Prompt the user to enter post content
        bot.sendMessage(msg.chat.id, "Please enter the post content:");
        bot.once("message", async (contentMessage) => {
          const content = contentMessage.text;

          // Fetch images from the user (you may need to handle image uploads separately)
          // bot.sendMessage(msg.chat.id, 'Please upload the image for the post:');
          // bot.once('photo', async (photoMessage) => {
          //     const image = photoMessage.photo[0].file_id;

          // Prompt the user to enter tags
          bot.sendMessage(
            msg.chat.id,
            "Please enter tags for the post (comma-separated):"
          );
          bot.once("message", async (tagsMessage) => {
            const tags = tagsMessage.text.split(",").map((tag) => tag.trim());

            // Create the post on the WordPress site
            const response = await createPostOnWordPress(
              title,
              categoryId,
              content,
              tags
            );

            // Send a confirmation message back to the user
            bot.sendMessage(
              msg.chat.id,
              "Post created successfully on WordPress!"
            );
          });
          // });
        });
      });
    });
  } catch (error) {
    console.error("Error creating post:", error);
    bot.sendMessage(
      msg.chat.id,
      "An error occurred while creating the post. Please try again later."
    );
  }
});

// Function to fetch categories from the WordPress site
async function fetchCategoriesFromWordPress() {
  const response = await axios.get(
    `https://inzeedo.com/wp-json/wp/v2/categories`
  );
  return response.data;
}

// Function to create a post on the WordPress site
async function createPostOnWordPress(title, categoryId, content, tags) {
  // Make a POST request to create the post on the WordPress site

  const options = {
    method: 'POST',
    url: 'https://inzeedo.com/wp-json/wp/v2/posts',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'insomnia/2023.5.8',
      Authorization: 'Basic YWRtaW5AaW56ZWVkby5jb206SFUxdyBqeFd0IEtIT2wgajgwWiBLN1daIEdQOEs='
    },
    data: {title: title, content: content, 'status': 'publish',categories: [categoryId]}
  };
  
  axios.request(options).then(function (response) {
    console.log(response.data);
  }).catch(function (error) {
    console.error(error);
  });
}

// const TelegramBot = require('node-telegram-bot-api');
// const express = require('express');

// // Initialize Express app
// const app = express();

// // Initialize Telegram bot
// const token = '6305948282:AAFJgAfof6cnNHKrXpFrB2T-Jbvx3HkSH9A'; // Get bot token from environment variable
// const bot = new TelegramBot(token, { polling: false });

// // Handle incoming messages
// bot.on('message', (msg) => {
//     const chatId = msg.chat.id;
//     const messageText = msg.text;

//     // Process incoming message and send response
//     bot.sendMessage(chatId, 'Received message: ' + messageText);
// });

// // Set up webhook
// const webhookUrl = '/webhook'; // Set up your webhook URL
// app.use(express.json());
// app.post(webhookUrl, (req, res) => {
//     bot.processUpdate(req.body);
//     res.sendStatus(200);
// });

// // Start server
// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
//     console.log(token);
// });

// const TelegramBot = require('node-telegram-bot-api');

// // replace the value below with the Telegram token you receive from @BotFather
// const token = '6305948282:AAFJgAfof6cnNHKrXpFrB2T-Jbvx3HkSH9A';

// // Create a bot that uses 'polling' to fetch new updates
// const bot = new TelegramBot(token, {polling: true});

// // Matches "/echo [whatever]"
// bot.onText(/\/echo (.+)/, (msg, match) => {
//   // 'msg' is the received Message from Telegram
//   // 'match' is the result of executing the regexp above on the text content
//   // of the message

//   const chatId = msg.chat.id;
//   const resp = match[1]; // the captured "whatever"

//   // send back the matched "whatever" to the chat
//   bot.sendMessage(chatId, resp);
// });

// // Listen for any kind of message. There are different kinds of
// // messages.
// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;

//   // send a message to the chat acknowledging receipt of their message
//   bot.sendMessage(chatId, 'Received your message');
// });
