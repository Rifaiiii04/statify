import { getXpForLevel, getXpToNextLevel } from '../src/db/repositories/stats-repository';

describe('Stats Repository Logic', () => {

  it('harus menghitung batas XP yang dibutuhkan untuk level saat ini', () => {
    // Pengguna level 1 harus mengumpulkan 100 XP untuk naik ke level 2
    expect(getXpToNextLevel(1)).toBe(100);

    // Pengguna level 5 harus mengumpulkan 500 XP untuk naik ke level 6
    expect(getXpToNextLevel(5)).toBe(500);
  });

  it('harus menghitung total akumulasi XP untuk mencapai level tertentu', () => {
    // Level 1 mulai dari 0 XP
    expect(getXpForLevel(1)).toBe(0);

    // Level 2 berarti pengguna sudah melewati 100 XP pertama
    expect(getXpForLevel(2)).toBe(100);

    // Level 3 berarti pengguna mengumpulkan 100 XP (lv1) + 200 XP (lv2) = 300 XP
    expect(getXpForLevel(3)).toBe(300);

    // Level 4 berarti = 300 + 300 (lv3) = 600 XP
    expect(getXpForLevel(4)).toBe(600);
  });

});
