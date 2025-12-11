import { BaseCounter } from "./components/deck_counter/base_counter";
import { DeckValidator } from "./components/deck_validator/deck_validator";
import { TileCount } from "./types/counter";

const fa_test: TileCount = {
    f1: 1,
    ff1: 1,
    f2: 1,
    ff2: 1,
    f3: 1,
    ff3: 1,
    f4: 1,
    ff4: 1,
};
const sixteenbd_test: TileCount = {
    m1: 1,
    m5: 1,
    m9: 1,
    s1: 1,
    s4: 1,
    s7: 1,
    t1: 1,
    t6: 1,
    t9: 1,
    east: 1,
    south: 1,
    west: 2,
    north: 1,
    zhong: 1,
    fa: 1,
    bak: 1,
};
const Thirteen_waist_test: TileCount = {
    m1: 1,
    m9: 1,
    s1: 1,
    s9: 1,
    t1: 1,
    t7: 1,
    t8: 1,
    t9: 3,
    east: 1,
    south: 1,
    west: 1,
    north: 1,
    zhong: 1,
    fa: 1,
    bak: 1,
};
const ligu_test: TileCount = { m1: 4, m5: 4, t1: 4, zhong: 2, bak: 3 };
const standard_test: TileCount = {
    m2: 1,
    m3: 1,
    m4: 1,
    west: 3,
    s5: 1,
    s3: 1,
    s4: 1,
    t3: 1,
    t4: 2,
    t5: 2,
    t6: 1,
    t8: 2,
};
const max_fan: TileCount = {
    f1: 1,
    ff1: 1,
    f2: 1,
    ff2: 1,
    f3: 1,
    ff3: 1,
    f4: 1,
    ff4: 1,
    south: 4,
    m1: 2,
    m9: 4,
    north: 4,
    east: 4,
    west: 4,
};

const curr_test = fa_test;

const deck_validator_test = new DeckValidator(curr_test);
const is_valid_test = deck_validator_test.fullCheck();
console.log("Valid:", is_valid_test);
console.log(
    "Number of possible decks:",
    deck_validator_test.possibleDecks.length
);
for (let i = 0; i < deck_validator_test.possibleDecks.length; i++) {
    console.log(`\nDeck ${i + 1}:`);
    console.log(deck_validator_test.possibleDecks[i]);
}

const winner_seat = 3;
const current_wind = "west";
const myself_mo = true;
const door_clear = true;
const winning_tile = Object.keys(curr_test)[0];
const base_value = 0;
const multiplier = 1;

const base_counter = new BaseCounter(
    curr_test,
    winner_seat,
    current_wind,
    winning_tile,
    myself_mo,
    door_clear,
    base_value,
    multiplier
);

const count_results = base_counter.base_count();
const value = count_results.value;
const logs = count_results.log;
const winning_deck = count_results.winning_deck;
const winning_deck_organized = count_results.winning_deck_organized;

console.log(`Value: ${value}`);
console.log(`Logs: ${logs}`);
console.log(`Winning deck:`, winning_deck);
console.log(`Winning deck_organized:`, winning_deck_organized);
