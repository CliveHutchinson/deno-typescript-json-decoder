import { decode, decoder, number, string, boolean, array, option } from './deno-typescript-json-decoder.ts';

type User = decode<typeof userDecoder>;
const userDecoder = decoder({
    id: number,
    username: string,
    isBanned: boolean,
    phoneNumbers: array(string),
    ssn: option(string),
});

const userPojo = {
    id: 100,
    username: "Fred",
    isBanned: false,
    phoneNumbers: ["0123", "0987"]
};

const user = userDecoder(userPojo);

console.log(user);