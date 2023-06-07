# coding: cp1251
#by z04a, stalgrim
from PIL import Image, ImageDraw, ImageFont
import qrcode, hashlib
from alive_progress import alive_bar
import time, sys
from gtts import gTTS
import zipfile, os
import sqlite3
import shutil

#библиотека и код для ввода параметров при запуске скприта
import argparse
parser = argparse.ArgumentParser(description='mark generator')
parser.add_argument('library', type=str, help='Library name') 
parser.add_argument('-l','--legacy', action='store_true', help='use legacy renderer') #флаг для использования устаревшего рендера
parser.add_argument('-b','--blank', action='store_true', help='do not draw arrows') #флаг для отключения отрисовки стрелок
parser.add_argument('-t','--text', action='store_true', help='disable text') #флаг для отключения отрисовки текста
args = parser.parse_args()

DEFAULT_IDENTIFIER = "3257b0ae1f8d05fed50a757017a93688" #md5 идентификатор приложения

LIBRARY_HASH = hashlib.md5(args.library.encode('utf-8')).hexdigest() #md5 идентификатор библиотеки

def create(room, ruroom, cursor):
    
    #Сборка строки для генерации qr кода

    ROOM_HASH = hashlib.md5(room.encode('utf-8')).hexdigest() #md5 идентификатор кабинета

    FINAL_HASH = DEFAULT_IDENTIFIER + " " + LIBRARY_HASH + " " + ROOM_HASH #сборка в одну строку

    #---------------

    result_file.write(f'{FINAL_HASH} {room} {ruroom}') #запись информации о комнате в result.txt
    
    cursor.execute(f'''INSERT INTO {args.library} (qr,name,nameRU) VALUES ("{ROOM_HASH}","{room.strip()}","{ruroom.strip()}")''') #запись информации в базу данных    
	
    upscaleqr_size = 1150 #разрешение, до которого будет масштабироваться qr код (1150x1150 к примеру)

    width = 2808 #конечная ширина метки
    height = 1984 #конечная высота метки
    
    #создание qr кода
    qrimg = qrcode.make(FINAL_HASH)
    upqr = qrimg.resize((upscaleqr_size,upscaleqr_size),resample=1)
    
    tts = gTTS(ruroom, lang='ru')
    tts.save('./audio/' + args.library + '_' + room + '.mp3')

    for i in range(1,3):
        if(i == 2):
            width = 1984
            height = 2808
        #создание фона
        newImg = Image.new(mode = "RGB", size = (width,height), color = (255,255,255))

        #заполнение диагональными полосками ## DEPRECATED. PLEASE DO NOT USE.
        if args.legacy:
            x = 0
            for number in range(40):
                img1 = ImageDraw.Draw(newImg)
                img1.line([(x - width,0),(x,height)], fill="black", width = 12)
                x += width/15
        #----------------

        if not args.legacy: #новый рендер
            if(i == 1):
                newImg.paste(diag_hor,(0,0))
            else:
                newImg.paste(diag_ver,(0,0))
            
        
        #вставка qr кода в центр изображения
        newImg.paste(upqr, (int(width/2 - upscaleqr_size/2), int(height/2 - upscaleqr_size/2)))

        #вставка стрелки
        if not args.blank:
            newImg.paste(arrow,(width-320,int(height/2-982/2)),arrow.convert('RGBA'))
            newImg.paste(arrow,(160,int(height/2-982/2)),arrow.convert('RGBA'))

        #вставка названия
        if not args.text:
            vot = Image.new(mode = "RGB", size = (width,80), color = (255, 255, 255))
            newImg.paste(vot, (0,height-80))
            idraw = ImageDraw.Draw(newImg)
            idraw.line((0,height-80,width,height-80), fill=0,width=8)
            font = ImageFont.truetype("src/newFont.ttf", size=80)
            bbox = idraw.textbbox((0,height-80),ruroom,font=font) #для того, чтобы выставить текст по центру экрана
            idraw.text((width/2-(bbox[2]/2),height-80), ruroom, font=font, fill=(0, 0, 0))
        #сохранение
        if i == 1:
            imgName = "result_hor/hor-" + args.library + "-" + room + ".png"
            newImg.save(imgName)
        else:
            imgName = "result_ver/vert-" + args.library + "-" + room + ".png"
            newImg.save(imgName)


#---------------main code---------------#
        
#пробуем открыть текстовый файл        
try:
    #открываем и читаем файл
    result_file = open('result.txt', 'w') #открываем файл, в который будем писать результат
    result_file.write('APPHASH  LIBRARYHASH  ROOMHASH  ROOM  RU_ROOM\n')
    with open("tmp/" + args.library + ".txt", "r",encoding="UTF-8") as file:
        list_data = [] #обьявляем пустые списки
        listru_data = []
        for item in file:
            items = item.split(" ",1) #делим строку по первому пробелу
            list_data.append(items[0]) #добавляем комнаты в список
            listru_data.append(items[1]) #добавляем русские названия комнат в список
    file.close()
except:
    print('ERR: File not found. Did you put your data in library.txt?')
    sys.exit() # если файл не найден, программа закрывается.

if(args.legacy): #предупреждение при использовании устаревшего рендера
    print('WRN: using LEGACY_RENDERER is deprecated.')

try:
    diag_hor = Image.open('src/diag_hor.png')
    diag_ver = Image.open('src/diag_ver.png')
    arrow = Image.open('src/arrow.png').convert('RGBA')
except:
    print('ERR: src images not found')
    sys.exit() # если файл не найден, программа закрывается.


conn = sqlite3.connect(args.library + '.db') 
c = conn.cursor() #создание базы данных

c.execute(f'''
          CREATE TABLE {args.library}
          ([qr] TEXT(32), [name] TEXT(50), [nameRU] TEXT(50))
          ''') #создание таблицы в базе данных

# #вывод прогресс
# with alive_bar(len(list_data)) as bar: 
    
#         //bar(i/100 * (100 / len(list_data)))

for i in range(0,len(list_data)):
        create(list_data[i], listru_data[i],c)
result_file.close()

conn.commit() #произвести запись данных в базу данных
               
tzf = zipfile.ZipFile(args.library + ".zip", "w") #создание zip архива для приложения
tzf.write(args.library + ".db")
for dirname, subdirs, files in os.walk("audio"):
    tzf.write(dirname)
    for filename in files:
    	if(filename != 'git.txt'):
        	tzf.write(os.path.join(dirname, filename))
tzf.close()
shutil.copy2(args.library + '.zip', 'res/')    	
zf = zipfile.ZipFile("resultzip/" + args.library + "_library" + ".zip", "w") #создание конечного zip архива для пользователя
zf.write("tmp/" + args.library + ".txt")
zf.write("result.txt")
zf.write(args.library + ".zip")
for dirname, subdirs, files in os.walk("result_hor"):
    zf.write(dirname)
    for filename in files:
    	if(filename != 'git.txt'):
            zf.write(os.path.join(dirname, filename))
            os.remove("./result_hor/" + filename)

for dirname, subdirs, files in os.walk("result_ver"):
    zf.write(dirname)
    for filename in files:
    	if(filename != 'git.txt'):
            zf.write(os.path.join(dirname, filename))
            os.remove("./result_ver/" + filename)
        	
zf.close()
conn.close()
if os.path.exists(args.library + ".db"):
  os.remove(args.library + ".db")
else:
    print("ERR: failed to delete .db file")

if os.path.exists("tmp/" + args.library + ".txt"):
  os.remove("tmp/" + args.library + ".txt")
else:
    print("ERR: failed to delete tmp .txt file")

if os.path.exists(args.library + ".zip"):
  os.remove(args.library + ".zip")
else:
    print("ERR: failed to delete .zip file")

for dirname, subdirs, files in os.walk("audio"):
    for filename in files:
    	if(filename != 'git.txt'):
            os.remove("./audio/" + filename)
