import { Pojo } from './pojo.ts';
import { literal, tuple, record } from './literal-decoders.ts';

/**
 * Json Literal Decoder
 * literal javascript objects used as if they were decoders
 * of themselves
 */

type PrimitiveJsonLiteralForm = string;
const isPrimitiveJsonLiteralForm = (
  v: unknown
): v is PrimitiveJsonLiteralForm => typeof v === 'string';

type TupleJsonLiteralForm = [Decoder<unknown>, Decoder<unknown>];
const isTupleJsonLiteralForm = (v: unknown): v is TupleJsonLiteralForm =>
  Array.isArray(v) && v.length === 2 && v.every(isDecoder);

type RecordJsonLiteralForm = { [key: string]: Decoder<unknown> };
const isRecordJsonLiteralForm = (v: unknown): v is RecordJsonLiteralForm =>
  typeof v === 'object' && v !== null && Object.values(v).every(isDecoder);

export type JsonLiteralForm =
  | PrimitiveJsonLiteralForm
  | TupleJsonLiteralForm
  | RecordJsonLiteralForm;
const isJsonLiteralForm = (decoder: unknown): decoder is JsonLiteralForm => {
  return (
    isPrimitiveJsonLiteralForm(decoder) ||
    isTupleJsonLiteralForm(decoder) ||
    isRecordJsonLiteralForm(decoder)
  );
};

/**
 * Run json literal decoder evaluation both at
 * type level and runtime level
 */

// prettier-ignore
type evalJsonLiteralForm<decoder> =
  [decoder] extends [PrimitiveJsonLiteralForm] ?
    decoder :
  [decoder] extends [[infer decoderA, infer decoderB]] ?
    [ decode<decoderA>, decode<decoderB> ] :

    {
      [key in keyof decoder]: decode<decoder[key]>;
    }
const decodeJsonLiteralForm = <json extends JsonLiteralForm>(
  decoder: json
): DecoderFunction<evalJsonLiteralForm<json>> => {
  if (isPrimitiveJsonLiteralForm(decoder)) {
    return literal(decoder) as any;
  }
  if (isTupleJsonLiteralForm(decoder)) {
    return tuple(decoder[0] as any, decoder[1] as any) as any;
  }
  if (isRecordJsonLiteralForm(decoder)) {
    return record(decoder as any) as any;
  }
  throw `shouldn't happen`;
};

/**
 * General decoder definition
 */

export type DecoderFunction<T> = (input: Pojo) => T;
const isDecoderFunction = (f: unknown): f is DecoderFunction<unknown> =>
  typeof f === 'function';

export type Decoder<T> = JsonLiteralForm | DecoderFunction<T>;
const isDecoder = <T>(decoder: unknown): decoder is Decoder<T> =>
  isJsonLiteralForm(decoder) || isDecoderFunction(decoder);

/**
 * Run evaluation of decoder at both type and
 * runtime level
 */

export type primitive = string | boolean | number | null | undefined;
// prettier-ignore
export type decode<decoder> =
  (decoder extends DecoderFunction<infer T> ?
    [decode<T>] :
  decoder extends JsonLiteralForm ?
    [evalJsonLiteralForm<decoder>]:

    [decoder] 
  // needs a bit of indirection to avoid
  // circular type reference compiler error
  )[0];

export const decoder = <D extends Decoder<unknown>>(
  _decoder: D
): DecoderFunction<decode<D>> => {
  if (!isDecoderFunction(_decoder)) {
    return decodeJsonLiteralForm(_decoder as any);
  }
  return _decoder as any;
};
