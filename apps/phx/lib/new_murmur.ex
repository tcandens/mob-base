defmodule NewMurmur do
  import Bitwise
  
  @c1 0xCC9E2D51
  @c2 0x1B873593
  @r1 15
  @r2 13
  @n 0xE6546B64
  @m 5

  def murmur3(data) when is_binary(data) do
    hash = case aux(0, data) do
      {h, []} ->
        h
      {h, t} ->
        h
        |> bxor(
          t
          |> ensure_little_endian()
          |> Kernel.*(@c1)
          |> mask_32
          |> rol_32(@r1)
          |> mask_32
          |> Kernel.*(@c2)
          |> mask_32
        )
    end

    hash
    |> bxor(byte_size(data))
    |> fmix32()
  end

  def murmur3(data) do
    murmur3(:binary.encode_unsigned(data))
  end

  defp aux(hash, <<a::size(8)-little-unit(4), r::binary>>) do
    k1 = k_op(a, @c1, @r1, @c2)

    hash
    |> bxor(k1)
    |> rol_32(@r2)
    |> Kernel.*(@m)
    |> Kernel.+(@n)
    |> mask_32
    |> aux(r)
  end

  defp aux(h, <<r::size(2)-little-unit(4)>>) do
    {h, r}
  end
  defp aux(hash, _), do: {hash, []}

  defp ensure_little_endian(data) do
    case System.endianness() do
      :little -> data
      :big -> 
        swap_uint(data)
    end
  end

  defp swap_uint(
    <<v1::8, v2::8, v3::8, v4::8, v5::8, v6::8, v7::8, v8::8>>
  ) do
    IO.puts "swap 8"
    v8 <<< 56
    |> bxor(v7 <<< 48)
    |> bxor(v6 <<< 40)
    |> bxor(v5 <<< 32)
    |> bxor(v4 <<< 24)
    |> bxor(v3 <<< 16)
    |> bxor(v2 <<< 8)
    |> bxor(v1)
  end

  defp swap_uint(
    <<v1::8, v2::8, v3::8, v4::8, v5::8, v6::8, v7::8>>
  ) do
    IO.puts "swap 7"
    v7 <<< 48
    |> bxor(v6 <<< 40)
    |> bxor(v5 <<< 32)
    |> bxor(v4 <<< 24)
    |> bxor(v3 <<< 16)
    |> bxor(v2 <<< 8)
    |> bxor(v1)
  end

  defp swap_uint(
    <<v1::8, v2::8, v3::8, v4::8, v5::8, v6::8>>
  ) do
    IO.puts "swap 6"
    v6 <<< 40
    |> bxor(v5 <<< 32)
    |> bxor(v4 <<< 24)
    |> bxor(v3 <<< 16)
    |> bxor(v2 <<< 8)
    |> bxor(v1)
  end

  defp swap_uint(
    <<v1::8, v2::8, v3::8, v4::8, v5::8>>
  ) do
    IO.puts "swap 5"
    v5 <<< 32
    |> bxor(v4 <<< 24)
    |> bxor(v3 <<< 16)
    |> bxor(v2 <<< 8)
    |> bxor(v1)
  end

  defp swap_uint(
    <<v1::8, v2::8, v3::8, v4::8>>
  ) do
    IO.puts "swap 4"
    v4 <<< 24
    |> bxor(v3 <<< 16)
    |> bxor(v2 <<< 8)
    |> bxor(v1)
  end

  defp swap_uint(
    <<v1::8, v2::8, v3::8>>
  ) do
    IO.puts "swap 3"
    v3 <<< 16
    |> bxor(v2 <<< 8)
    |> bxor(v1)
  end

  defp swap_uint(
    <<v1::8, v2::8>>
  ) do
    IO.puts "swap 2"
    v2 <<< 8
    |> bxor(v1)
  end

  defp swap_uint(<<v1::8>>) do 
    IO.puts "swap 1"
    0 |> bxor(v1)
  end

  defp mask_32(x), do: x &&& 0xFFFFFFFF

  defp rol_32(x, r), do: mask_32(x <<< r ||| x >>> (32 - r))

  defp k_op(k, c1, rol, c2) do
    k
      |> Kernel.*(c1)
      |> mask_32
      |> rol_32(rol)
      |> mask_32
      |> Kernel.*(c2)
      |> mask_32
  end

  defp fmix32(h) do
    h
    |> xorbsr(16)
    |> Kernel.*(0x85EBCA6B)
    |> mask_32
    |> xorbsr(13)
    |> Kernel.*(0xC2B2AE35)
    |> mask_32
    |> xorbsr(16)
  end

  defp xorbsr(h, v), do: h |> bxor(h >>> v)

end
