TSM_NAME = ['m', 't', 's']
M_DICT = {f'{TSM_NAME[0]}{i}': i for i in range(1, 10)}
T_DICT = {f'{TSM_NAME[1]}{i}': i for i in range(1, 10)}
S_DICT = {f'{TSM_NAME[2]}{i}': i for i in range(1, 10)}
WIND_DICT = {'east', 'south', 'west', 'north'}
ZFB_DICT = {'zhong', 'fa', 'bai'}
FLOWER_DICT = {'f1' : 1, 'f2' : 2, 'f3' : 3, 'f4' : 4, 'ff1' : 1, 'ff2' : 2, 'ff3' : 3, 'ff4': 4}
SEAT_DICT = {1: 'east', 2: 'south', 3: 'west', 4: 'north'}
JOKER_DICT = 'joker'

MST_DICT = M_DICT | T_DICT | S_DICT

ALL_TILES_NO_FLOWER = (list(M_DICT.keys()) + list(T_DICT.keys()) + list(S_DICT.keys()) + list(WIND_DICT) + list(ZFB_DICT))
EYES_DICT = 'eyes'
SHANG_DICT = 'shang'
PONG_DICT = 'pong'
GONG_DICT = 'gong'

#Types of Hu
flower_hu = '花胡'
ligu_hu = 'Ligu'
sixteen_bd_hu = '16不搭'
thirteen_waist_hu ='十三么/腰'
standard_hu = '普通胡'