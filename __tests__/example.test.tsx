// Sebuah fungsi sederhana yang menjumlahkan 2 angka
function tambah(a: number, b: number) {
    return a + b;
}

describe("Fungsi Matematika Dasar", () => {
    it("harus menjumlahkan dua angka dengan benar", () => {
        const hasil = tambah(5, 7);
        // Memastikan hasilnya adalah 12
        expect(hasil).toBe(12);
    });
    
    it("harus menangani angka negatif", () => {
        const hasil = tambah(5, -2);
        expect(hasil).toBe(3);
    });
});
