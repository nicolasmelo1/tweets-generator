import { createFileRoute } from "@tanstack/react-router";
import "../App.css";
import { TweetGenerator } from "../utils";
import { useEffect, useMemo, useState } from "react";
export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const [generatedTweet, setGeneratedTweet] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [tweetGenerator] = useState(
    new TweetGenerator({
      embeddingDim: 64,
      hiddenUnits: 128,
      maxLength: 20,
      temperature: 0.8,
    }),
  );
  useMemo(() => {
    train();
  }, [tweetGenerator]);

  async function train() {
    // Sample tweets from user data (you'd replace this with actual user data from X)
    const userTweets: string[] = [
      "Just finished my morning run. The sunrise was absolutely breathtaking today! #morningmotivation #fitness",
      "Can't believe how fast technology is advancing. Remember when we thought 1GB was a lot of storage? #TechThoughts",
      "Made grandma's secret pasta recipe tonight and the whole family loved it! Some traditions are worth keeping alive.",
      "Hot take: pineapple DOES belong on pizza. Fight me. #TeamPineapple",
      "Working from home pro tip: set boundaries with your time or you'll end up working 24/7. #WFHLife",
      "Just adopted the sweetest rescue pup! Meet Max, my new best friend. #AdoptDontShop #DogLover",
      "Nothing beats curling up with a good book on a rainy day. Currently reading 'The Midnight Library' and I'm hooked!",
      "Friendly reminder to drink water and check your posture. You're welcome. #SelfCare",
      "The new season of Stranger Things has me on the edge of my seat! No spoilers please! #StrangerThings",
      "Just hit 10k followers! Thanks for all the support on my fitness journey. You guys keep me motivated!",
      "Pro tip: When traveling, always pack a small power strip. Turn one outlet into many. You'll be the airport hero. #TravelHacks",
      "My 5-year-old just asked why the moon follows our car. Kids ask the best questions. #ParentingMoments",
      "The office coffee machine broke down. This is not a drill. Send help and caffeine. #MondayProblems",
      "Just witnessed the most beautiful sunset at the beach. Some moments you just have to stop and appreciate. ❤️ #Grateful",
      "Hot take: meetings that could have been emails are the true productivity killers. #CorporateLife",
      "Lesson learned: never grocery shop when hungry. My wallet and my bizarre food combinations regret this decision.",
      "My cat just knocked over my plant for the third time this week. I think it's personal at this point. #CatProblems",
      "Finally achieved a personal best on my deadlift today! 250lbs! Hard work paying off. #FitnessGoals #GymLife",
      "Anyone else have 57 browser tabs open or is it just me? #DigitalHoarder",
      "Just submitted my final thesis! 4 years of hard work condensed into 200 pages. Time to celebrate! #PhDLife",
      "PSA: Check on your introverted friends. They're not mad, they're just recharging. #IntrovertProblems",
      "The new coffee shop downtown makes the BEST latte I've ever had. Run, don't walk! #CoffeeAddict",
      "Currently stuck in traffic and questioning all my life choices that led to this commute. #TrafficJam",
      "Just received the news - I GOT THE JOB! So excited for this new chapter! #NewBeginnings #CareerMoves",
      "My sourdough starter is finally alive and bubbling! Bread-making adventures begin tomorrow. #Sourdough #HomeBaker",
      "Anyone else feel personally attacked when their phone reminds them of their screen time? Just me? #DigitalDetox",
      "Three meetings in a row without a break should be illegal. My brain is officially fried. #WorkLife",
      "Successfully assembled IKEA furniture without a single extra screw. This is my peak adult achievement. #AdultingWin",
      "The dog ate my AirPods. Not even making this up. RIP to my music listening experience. #DogOwnerProblems",
      "Just finished a 1000-piece puzzle only to discover one piece is missing. This is my villain origin story. #PuzzleProblems",
      "First day of vacation and I've already disconnected from all work emails. Freedom feels incredible! #VacationMode",
      "Sometimes I think about how wild it is that we carry tiny supercomputers in our pockets all day. #DeepThoughts",
      "Made the switch to reusable bags and metal straws. Small changes add up! #SustainableLiving",
      "When your playlist shuffles to exactly the right song at exactly the right moment. *chef's kiss* #MusicMoments",
      "Just PR'd my 5k time! Under 25 minutes for the first time ever! #RunningCommunity #PersonalBest",
      "The barista spelled my name right today. Is this what winning the lottery feels like? #SimpleJoys",
      "Home office upgrade complete! New desk, better lighting, ergonomic chair. My back says thank you. #RemoteWork",
      "Learning to play guitar at 40. You're never too old to try something new! #NeverTooLate #NewHobbies",
      "Just witnessed my kid's first steps! Heart. Is. Melting. #ParentingMilestones #BabySteps",
      "Unpopular opinion: black licorice is actually delicious. #SnackDebate",
      "Power went out during my Zoom presentation. Using phone hotspot and presenting by candlelight. 2025 problems. #RemoteWorkFail",
      "My succulent survived three whole months under my care. This is unprecedented. #PlantParenthood #SmallWins",
      "Airport delays and my phone is at 10%. Pray for me. #TravelNightmare",
      "Found a $20 bill in my coat pocket from last winter. Past me looking out for future me! #UnexpectedWin",
      "Just climbed my first mountain! The view from the top made every step worth it. #HikingAdventures #BucketList",
      "When your favorite song comes on at the gym and suddenly you can lift twice as much. #GymMotivation",
      "Attended my first pottery class. Everything I made looks like it was created by a toddler, but I had fun! #NewSkills",
      "That moment when you finally fix the bug in your code that's been driving you crazy for hours. #CodingLife #SweetRelief",
      "Just tried that viral TikTok recipe and... it actually lived up to the hype! #FoodTok #RecipeWin",
      "Three day weekend approaching and I've never been more ready! Plans include: absolutely nothing. #MentalHealth",
      "My house plants are thriving and I've never been more proud of anything in my life. #PlantParent",
      "Got caught singing dramatically in the car by the person in the next lane. Made direct eye contact and kept going. #NoRegrets",
      "Meal prepped for the entire week in just two hours! Future me will be so grateful. #MealPrep #HealthyHabits",
      "Just had to explain to my dad that he doesn't need to yell when talking on speakerphone. Technology is hard. #ParentsAndTech",
      "Pulled an all-nighter to finish this project. Running purely on coffee and determination now. #DeadlineMode",
      "The satisfaction of peeling the protective film off new electronics. One of life's simple pleasures. #SmallJoys",
      "My 7-year-old just asked if clouds are made of cotton candy. Childhood innocence is precious. #KidsLogic",
      "First attempt at homemade sushi was... humbling. Tastes better than it looks though! #CookingAdventures",
      "Just found out my vintage vinyl collection is actually worth something. Not selling, but nice to know! #VinylCollector",
      "Working out: 30 minutes. Taking gym selfies: 45 minutes. Priorities, right? #GymLife #JustKidding",
      "The way my dog looks at me when I eat cheese without sharing should be considered emotional manipulation. #DogOwnerLife",
      "Spending Friday night organizing my bookshelf by color. This is peak adulthood. #BookNerd #OrganizationSatisfaction",
      "Just parallel parked on the first try with people watching. This is my Olympic gold medal moment. #DrivingWin",
      "Nothing makes you clean your house like having guests coming over in 30 minutes. #SuddenProductivity",
      "Learned three chords on the ukulele and now I won't stop playing the same song over and over. Sorry, neighbors! #MusicJourney",
      "The moment when your favorite author announces a new book and your whole day improves instantly. #BookLover",
      "Trying to fold a fitted sheet should be an Olympic sport. Gold medal in frustration. #LaundryProblems",
      "When your phone autocorrects to something completely inappropriate in a work text. Mortified. #AutocorrectFail",
      "Just paid off my student loans after 10 years! Never thought this day would come! #DebtFree #FinancialMilestone",
      "The perfect cup of coffee on a Monday morning is basically a religious experience. #MondayMood #CoffeeLover",
      "That feeling when you find the perfect avocado at the grocery store. Not too hard, not too soft. #SmallVictories",
      "Home haircut experiment results: I've made a huge mistake. Hat season starts now. #QuarantineHaircuts",
      "My dog just sighed dramatically when I said it's too rainy for a walk. The attitude is strong with this one. #DogPersonality",
      "Just found out my Zoom camera was on during my intense lip sync performance to Beyoncé. Career change imminent. #WorkFromHomeFail",
      "Nothing says 'I'm an adult' like getting excited about a new vacuum cleaner. And yet, here we are. #AdultingRealities",
      "That post-workout feeling when you're simultaneously exhausted and energized. Endorphins are magic. #FitnessJourney",
      "Bought a plant two weeks ago and it's still alive. This might be a personal record. #BlackThumbProblems",
      "Spent three hours down a Wikipedia rabbit hole about ancient Egyptian burial practices. Time well spent? #CuriousMind",
      "Just discovered my new favorite podcast and now I want to be best friends with the hosts. Is this normal? #PodcastObsession",
      "The printer senses fear. Stay calm and assert dominance. #OfficeTech #PrinterProblems",
      "Successfully navigated IKEA without buying anything I didn't need. Willpower level: expert. #ShoppingRestraint",
      "Nothing quite like the triumph of finding the matching sock you thought was lost forever. #LaundryVictories",
      "My smart home device just turned on music in the middle of the night for no reason. Not creepy at all. #TechGlitches",
      "That moment when you realize your 'quick 5-minute task' is now entering hour two. Time is an illusion. #ProductivityMyths",
      "Successfully kept a conversation going without once mentioning the weather. Social skills leveling up! #SmallTalk",
      "Just received a handwritten letter in the mail. In this digital age, it feels like finding treasure. #OldSchoolCommunication",
      "When your playlist randomly shuffles to a song you forgot existed but used to love. Hello, 2010 memories! #MusicThrowback",
      "The satisfaction of crossing the last item off your to-do list is unmatched. Productivity level: hero. #GettingThingsDone",
      "Woke up thinking it was Friday. It's only Tuesday. This week is already too long. #WeekdayConfusion",
      "Just watched a squirrel perform what can only be described as parkour in my backyard. Nature's entertainment. #BackyardWildlife",
      "Realized I've been mispronouncing a common word for my entire life. No one corrected me until now. Trust issues activated. #LanguageFails",
      "When someone remembers a small detail you mentioned weeks ago. That's the good stuff. #FriendshipGoals",
      "Just finished a book that was so good I need a moment of silence to process before starting anything new. #BookHangover",
      "The panic when your phone slips from your hand and time slows down as you watch it fall. #ModernNightmares",
      "Sometimes I think about how wild it is that we're all just spinning on a rock in space. #ExistentialThoughts",
    ];

    // Create and train the model

    if (!tweetGenerator.model) {
      await tweetGenerator.train(userTweets);
    }

    // Save the model
    await tweetGenerator.saveModel("tweet-generator-model");
    setIsLoading(false);
  }

  async function generate() {
    setIsLoading(true);

    const generatedTweet = await tweetGenerator.generate("I like cooking", 30);

    setGeneratedTweet(generatedTweet);
    setIsLoading(false);
  }

  return (
    <div className="App">
      <button onClick={generate} disabled={isLoading}>
        Generate Tweet
      </button>
      <p>Generated Tweet: {generatedTweet}</p>
    </div>
  );
}
