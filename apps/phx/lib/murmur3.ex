defmodule Murmur3 do
  def murmur3(str, seed \\ 0) do
    c1 = <<16#cc9e2d51::32>>;
    c2 = <<16#1b873593::32>>;
    r1 = 15;
    r2 = 13;
    m = 5;
    n = <<16#e6546b64::32>>;
    len = String.length(str);

    hash = seed;

    str
    |> String.graphemes()
    |> Enum.each(fn grapheme ->
      k = String.to_integer(grapheme);
      k = k &&& 16#ff;
      k = k ||| (k <<< 8);
      k = k * c1;
      k = k <<< r1 ||| (k >>> (32 - r1));
      k = k * c2;
      hash = :kernel.^(hash, k);
      hash = :kernel.*(hash <<< r2 ||| (hash >>> (32 - r2)), m) + n;
    end);

    hash = :kernel.^(hash, len);
    hash = :kernel.^(hash, :kernel.^(hash >>> 16));
    hash = :kernel.^(hash, :kernel.*(<<16#85ebca6b::32>>));
    hash = :kernel.^(hash, :kernel.^(hash >>> 13));
    hash = :kernel.*(hash, <<16#c2b2ae35::32>>);
    hash = :kernel.^(hash, :kernel.^(hash >>> 16));

    hash
  end
end

