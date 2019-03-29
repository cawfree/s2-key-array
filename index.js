const { S2 } = require('s2-geometry');

// XXX: Converts a latitude and longitude into an integer
//      array of length 31 which encodes all S2 key information
//      into an equivalent (albeit smaller) representation. This
//      data is *not compressed, so it can still be easily indexed
//      against.
//
//      The array representation exploits a redundancy in the
//      fact that Levels 1 -> 15 have all zeros for last 15
//      digits, and Levels 16 -> 30 have the value at [15] as
//      the first 15 digits.
//
//      This approach means that we are storing the minimum 
//      data we require to convey every level of S2 without
//      data loss or mutating the data through compression.
//
//      Array Contents (.length === 31):
//      [0] === S2 Face
//      [1 : 15] === Most Signficant 15 decimal digits of S2 Level
//      [16 : 30] === Least Significant 15 decimal digits of S2 Level
//
//      When we talk about most signficant and least significant digits,
//      we are referring to when the S2 code is represented as a zero-padded
//      string of length 30 (without the prefix "face/").

const latLngToCoefficients = (latitude, longitude) => {
  return [...Array(30)]
    .map((e, i) => (i + 1))
    .reduce(
      (arr, level) => {
        const s2 = S2
          .latLngToKey(
            latitude,
            longitude,
            level,
          ); 
        const i = s2.indexOf('/');
        const n = s2.substring(i + 1);
        const a = [...Array(Math.max(0, 30 - n.length))]
          .reduce(
            s => `${s}0`,
            n,
          );
        if (level <= 15) {
          return ([
            ...arr,
            Number.parseInt(a.substring(0, 15)),
          ]);
        }
        return ([
          ...arr,
          Number.parseInt(a.substring(15)),
        ]);
      },
      [
        Number.parseInt(
          S2.latLngToKey(
            latitude,
            longitude,
            1,
          )
            .substring(0, 1),
        ),
      ],
    );
};

// XXX: Converts an integer array of S2 coefficients back
//      into an array of the  equivalent S2 strings.
//      The returned array contains all S2 keys, where the
//      index is equal to the corresponding S2 level of
//      the original geopoint, minus one.

const coefficientsToS2 = (coeff) => {
  const f = coeff[0];
  return [...Array(30)]
    .map((e, i) => (i + 1))
    .reduce(
      (arr, i) => {
        if (i < 16) {
          const msb = coeff[i].toString();
          const a = [...Array(15 - msb.length)]
            .reduce(
              str => `0${str}`,
              msb,
            );
          return ([
            ...arr,
            `${f}/${a.substring(0, i)}`,
          ]);
        }
        const lsb = coeff[i].toString();
        const a = [...Array(15 - lsb.length)]
          .reduce(
            str => `0${str}`,
            lsb,
          );
        return ([
          ...arr,
          `${arr[14]}${a.substring(0, (i - 15))}`,
        ]);
      },
      [],
    );
};

module.exports = {
  latLngToCoefficients,
  coefficientsToS2,
};
