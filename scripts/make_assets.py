from PIL import Image

SRC = 'logo.jpg'


def make_icon(out_name, size, scale, bg=(255, 255, 255, 255)):
    logo = Image.open(SRC).convert('RGBA')
    W = size
    new = int(W * scale)
    resized = logo.resize((new, new), Image.LANCZOS)
    canvas = Image.new('RGBA', (W, W), bg)
    canvas.paste(resized, ((W - new) // 2, (W - new) // 2), resized)
    canvas.save('assets/' + out_name, 'PNG')
    print('wrote', out_name, canvas.size)


# Icons: add white margin so the Android mask never crops the artwork (incl. "wiki")
make_icon('icon.png', 1024, 0.80)
make_icon('adaptive-icon.png', 1024, 0.80)
make_icon('favicon.png', 512, 0.92)

# Splash: dark navy background, full logo centered
W, H = 1284, 2778
logo = Image.open(SRC).convert('RGBA')
bg = Image.new('RGBA', (W, H), (11, 18, 32, 255))
ratio = min((W * 0.5) / logo.width, (H * 0.42) / logo.height)
nw = int(logo.width * ratio)
nh = int(logo.height * ratio)
resized = logo.resize((nw, nh), Image.LANCZOS)
x = (W - nw) // 2
y = int((H - nh) * 0.40)
bg.paste(resized, (x, y), resized)
bg.save('assets/splash.png', 'PNG')
print('wrote splash.png', bg.size)
