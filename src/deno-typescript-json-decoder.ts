import { decoder, decode, Decoder, DecoderFunction } from './types.ts';
import { tuple, literal } from './literal-decoders.ts';
import { union, option, array, set, map, dict } from './higher-order-decoders.ts';
import {
  string,
  number,
  boolean,
  undef,
  nil,
  date,
} from './primitive-decoders.ts';


export { decoder, tuple, literal, union, option, array, set, map, dict, string, number, boolean, undef, nil, date };

export type { decode, Decoder, DecoderFunction };
