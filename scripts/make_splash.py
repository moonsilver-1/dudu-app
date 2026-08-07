from PIL import Image

src = 'd:/coding/newsheep2goat/dudu-app/logo.jpg'
out = 'd:/coding/newsheep2goat/dudu-app/assets/splash.png'

logo = Image.open(src).convert('RGBA')
W, H = 1284, 2778
bg = Image.new('RGBA', (W, H), (11, 18, 32, 255))

ratio = min((W * 0.5) / logo.width, (H * 0.4) / logo.height)
new_w = int(logo.width * ratio)
new_h = int(logo.height * ratio)
logo_resized = logo.resize((new_w, new_h), Image.LANCZOS)

x = (W - new_w) // 2
y = int((H - new_h) * 0.42)

bg.paste(logo_resized, (x, y), logo_resized)
bg.save(out, 'PNG')
print('saved', out, bg.size)
