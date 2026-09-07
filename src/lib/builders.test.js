import { builders, handleOrUrl, normalizePhone, ensureHttps } from "./builders";

describe("handleOrUrl", () => {
  it("builds a profile URL from a handle", () => {
    expect(handleOrUrl("@aitechies", "https://instagram.com/").value).toBe("https://instagram.com/aitechies");
  });
  it("keeps a pasted URL and adds https", () => {
    expect(handleOrUrl("instagram.com/aitechies", "https://instagram.com/").value).toBe("https://instagram.com/aitechies");
    expect(handleOrUrl("https://www.instagram.com/x/", "https://instagram.com/").value).toBe("https://www.instagram.com/x/");
  });
  it("keeps the @ for platforms that need it", () => {
    expect(handleOrUrl("shop", "https://youtube.com/", { keepAt: true }).value).toBe("https://youtube.com/@shop");
  });
  it("errors on empty input", () => {
    expect(handleOrUrl("", "https://x.com/").error).toBeTruthy();
  });
});

describe("phone helpers", () => {
  it("adds the default country code to 10-digit numbers", () => {
    expect(normalizePhone("98765 43210")).toBe("919876543210");
    expect(normalizePhone("+44 7911 123456")).toBe("447911123456");
    expect(normalizePhone("0091 98765 43210")).toBe("919876543210");
  });
  it("builds wa.me links with encoded messages", () => {
    expect(builders.whatsapp({ phone: "9876543210", message: "Hi there" }).value).toBe("https://wa.me/919876543210?text=Hi%20there");
  });
});

describe("google", () => {
  it("turns a Place ID into a write-review link", () => {
    expect(builders.googleReview({ input: "ChIJN1t_tDeuEmsRUsoyG83frY4" }).value).toBe(
      "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4",
    );
  });
  it("accepts a review link", () => {
    expect(builders.googleReview({ input: "g.page/r/abc/review" }).value).toBe("https://g.page/r/abc/review");
  });
  it("turns a business name into a Maps search", () => {
    expect(builders.googleMaps({ input: "Saravana Bhavan T Nagar" }).value).toContain("maps/search/?api=1&query=Saravana%20Bhavan");
  });
});

describe("special payloads", () => {
  it("escapes Wi-Fi credentials", () => {
    expect(builders.wifi({ ssid: "Shop;WiFi", password: "p:a,s", encryption: "WPA" }).value).toBe("WIFI:T:WPA;S:Shop\\;WiFi;P:p\\:a\\,s;;");
    expect(builders.wifi({ ssid: "Open", encryption: "nopass" }).value).toBe("WIFI:T:nopass;S:Open;;");
    expect(builders.wifi({ ssid: "X", password: "", encryption: "WPA" }).error).toBeTruthy();
  });
  it("builds UPI intents", () => {
    const v = builders.upi({ upiId: "shop@okaxis", name: "My Shop", amount: "150" }).value;
    expect(v).toBe("upi://pay?pa=shop%40okaxis&pn=My+Shop&am=150.00&cu=INR");
    expect(builders.upi({ upiId: "not-a-upi" }).error).toBeTruthy();
  });
  it("builds a vCard", () => {
    const v = builders.vcard({ firstName: "Ansar", lastName: "Ibrahim", org: "AiTechies", phone: "9876543210", email: "a@b.com" }).value;
    expect(v).toContain("BEGIN:VCARD");
    expect(v).toContain("FN:Ansar Ibrahim");
    expect(v).toContain("TEL;TYPE=CELL:+919876543210");
    expect(v).toContain("END:VCARD");
  });
  it("normalises plain links", () => {
    expect(ensureHttps("yourshop.com")).toBe("https://yourshop.com");
    expect(builders.link({ url: "mailto:a@b.com" }).value).toBe("mailto:a@b.com");
    expect(builders.link({ url: "hello world" }).error).toBeTruthy();
  });
});
