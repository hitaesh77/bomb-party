import { adultPrompts } from './adult-prompts';
import { extraPrompts } from './extra-prompts';
export type Mode = 'normal' | 'adult';
export type Prompt = {
    text: string;
    category: string;
    adult: boolean;
};
const groups: [
    string,
    boolean,
    string[]
][] = [
    ['Around the world', false, ['a country in Europe', 'a capital city', 'a country in Asia', 'a famous landmark', 'something you pack for a holiday', 'a road trip destination', 'something at an airport', 'a language', 'a city by the sea', 'a reason a flight gets delayed', 'something tourists do', 'a way to travel']],
    ['Everyday things', false, ['something in a kitchen', 'something in a bathroom', 'something in a junk drawer', 'something you lose all the time', 'something you borrow', 'something that needs batteries', 'something in a dorm room', 'something in your bag', 'something you clean', 'something that makes a loud noise', 'something with wheels', 'something in the fridge']],
    ['Snack attack', false, ['a pizza topping', 'a type of pasta', 'an ice cream flavor', 'a breakfast food', 'a fast food restaurant', 'a green vegetable', 'a food you eat with your hands', 'something on a brunch menu', 'a spicy food', 'a type of cheese', 'a food people disagree about', 'something you put on toast']],
    ['Pop culture', false, ['a celebrity', 'a superhero', 'an animated movie', 'a TV sitcom', 'a band', 'a movie villain', 'a reality TV show', 'a fictional animal', 'a song with a name in its title', 'a movie set in space', 'a musical instrument', 'a video game character']],
    ['Game on', false, ['a sport played with a ball', 'an NBA team', 'an Olympic sport', 'something at a stadium', 'a board game', 'a playground game', 'a piece of sports equipment', 'a reason a referee blows the whistle', 'a water sport', 'a card game', 'something you do at a gym', 'a team mascot']],
    ['Brand names', false, ['a car brand', 'a clothing brand', 'a cereal brand', 'a shoe brand', 'a supermarket chain', 'a chocolate brand', 'a soft drink', 'a toy brand', 'a streaming service', 'a makeup brand', 'a furniture store', 'a brand with an animal logo']],
    ['School & work', false, ['a school subject', 'something in a pencil case', 'an excuse for being late', 'a job with a uniform', 'something in an office', 'something a teacher says', 'a reason to call a meeting', 'something you do on a lunch break', 'a job involving animals', 'something in a science lab', 'a school club', 'something on a résumé']],
    ['Digital life', false, ['an app on your phone', 'something people search online', 'an emoji', 'a reason Wi-Fi stops working', 'something you screenshot', 'a computer accessory', 'something a smartwatch does', 'a notification you receive', 'something people post online', 'a terrible password idea', 'something you forget to charge', 'a reason to mute a group chat']],
    ['Wild card', false, ['an animal with a tail', 'something that flies', 'something that smells good', 'something you collect', 'something red', 'something in the sky', 'something at the beach', 'something you fear', 'something that comes in pairs', 'something that melts', 'something you can tie in a knot', 'something to take to a deserted island']],
    ['Human nature', false, ['something people pretend to understand', 'something people lie about', 'a reason to leave a party early', 'something awkward in an elevator', 'a bad gift', 'something you should never microwave', 'something people argue about', 'something overrated', 'something worth waiting in line for', 'a small everyday victory', 'something that ruins a picnic', 'a weird thing to say in a job interview']],
];
const originalPrompts: Prompt[] = groups.flatMap(([category, adult, items]) => items.map(item => ({ text: `Name ${item}`, category, adult })));

export const prompts: Prompt[] = [...originalPrompts, ...extraPrompts, ...adultPrompts];
