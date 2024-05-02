const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const token = "6305948282:AAFJgAfof6cnNHKrXpFrB2T-Jbvx3HkSH9A";
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/create/, async (msg) => {
  try {
    // Start the conversation with the user
    bot.sendMessage(msg.chat.id, "Please enter the title of the post:");
    bot.once("message", async (titleMessage) => {
      const title = titleMessage.text;

      
      const categories = await fetchCategoriesFromWordPress();

      
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

      
      bot.once("callback_query", async (categoryQuery) => {
        const categoryData = JSON.parse(categoryQuery.data);
        const categoryId = categoryData.category_id;

        
        bot.sendMessage(msg.chat.id, "Please enter the post content:");
        bot.once("message", async (contentMessage) => {
          const content = contentMessage.text;

          bot.sendMessage(
            msg.chat.id,
            "Please enter tags for the post (comma-separated):"
          );
          bot.once("message", async (tagsMessage) => {
            const tags = tagsMessage.text.split(",").map((tag) => tag.trim());

            
            const response = await createPostOnWordPress(
              title,
              categoryId,
              content,
              tags
            );

            
            bot.sendMessage(
              msg.chat.id,
              "Post created successfully on WordPress!"
            );
          });

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


async function fetchCategoriesFromWordPress() {
  const response = await axios.get(
    `https://inzeedo.com/wp-json/wp/v2/categories`
  );
  return response.data;
}


async function createPostOnWordPress(title, categoryId, content, tags) {
  

  const options = {
    method: 'POST',
    url: 'https://inzeedo.com/wp-json/wp/v2/posts',
    headers: {
      'Content-Type': 'application/json',
      
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

