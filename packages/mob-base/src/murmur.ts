const c1 = 0xcc_9e_2d_51;
const c2 = 0x1b_87_35_93;
const r1 = 15
const r2 = 13
const n = 0xE6_54_6B_64
const m = 5

function bigm(a: number, b: number): BigInt {
  return BigInt(a) * BigInt(b)
}

function mask32(x: bigint) {
  if (typeof x !== 'bigint') {
    x = BigInt(x)
  }
  return BigInt.asUintN(32, x) & BigInt.asUintN(32, BigInt(0xFFFFFFFF))
}


function rol(x: bigint, n: number) {
  return mask32(BigInt(Number(x) << n | Number(x) >>> (32 - n)))
}


let _isLittleEndian: boolean;
function isLittleEndian(): boolean {
  if (typeof _isLittleEndian !== 'undefined') {
    return _isLittleEndian
  }
  const buffer = new ArrayBuffer(2)
  const view = new DataView(buffer)
  view.setUint16(0, 1, true)
  return view.getUint16(0, true) === 1
}

function ensureLittleEndian(x: bigint): bigint {
   if (isLittleEndian()) {
    return x
  }

  const bits = x.toString(2).replace(/^0b/, '')
  const bytecount = Math.floor(bits.length / 8)
  return swapBytes(x, BigInt(0), bytecount)
}

const b256 = BigInt(0x100)

function swapBytes(n: bigint, p: bigint, t = 8): bigint {
  n = BigInt.asUintN(64, n)
  if (t) {
    return swapBytes(
      BigInt(Number(n) >>> 8), 
      (p * b256 + n % b256),
      t - 1
    )
  } else {
    return p
  }
}

export function murmur(key: string) {
  const buffer = new TextEncoder().encode(key);

  let idx = 0
  let hash = BigInt(0)
  let k1: bigint
  let bytelength = buffer.length

  while (idx < bytelength) {
    // 8 bytes at a time
    const bytechunk = (
      (buffer[idx] & 0xff) |
      ((buffer[++idx] & 0xff) << 8) |
      ((buffer[++idx] & 0xff) << 16) |
      ((buffer[++idx] & 0xff) << 24)
    )
    idx++

    if (bytechunk < 0xFF) {
      let d = ensureLittleEndian(BigInt(bytechunk))
      d = d * BigInt(c1)
      d = mask32(d)
      d = rol(d, r1)
      d = mask32(d)
      d = d * BigInt(c2)
      d = mask32(d)
      hash = hash ^ d
    } else {
      const a = bigm(bytechunk, c1) as bigint
      k1 = mask32(a)
      k1 = rol(k1, r1)
      k1 = k1 * BigInt(c2)
      k1 = mask32(k1)

      hash = BigInt(hash) | k1
      hash = rol(hash, r2)
      hash = hash * BigInt(m)
      hash = hash + BigInt(n)
      hash = mask32(hash)
    }

  }

  hash = hash ^ BigInt(bytelength)
  hash = fmix32(hash)

  return hash
}

function fmix32(hash: bigint) {
  hash = xorbsr(hash, 16n)
  hash = hash * BigInt(0x85ebca6b)
  hash = mask32(hash)
  hash = xorbsr(hash, 13n)
  hash = hash * BigInt(0xc2b2ae35)
  hash = mask32(hash)
  hash = xorbsr(hash, 16n)
  return hash
}

function xorbsr(h: bigint, v: bigint) {
  return (h ^ (h >> v))
}


