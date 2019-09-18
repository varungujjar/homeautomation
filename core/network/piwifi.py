import re
import subprocess
import os

cellNumberRe = re.compile(r"^Cell\s+(?P<cellnumber>.+)\s+-\s+Address:\s(?P<mac>.+)$")
cellNumberReS = re.compile(r"^(?P<interface>.+)\d\s+IEEE\s(?P<interface_id>.+) \s+ESSID:\"(?P<essid>.*)\"$")

regexps = [
    re.compile(r"^ESSID:\"(?P<essid>.*)\"$"),
    re.compile(r"^Protocol:(?P<protocol>.+)$"),
    re.compile(r"^Mode:(?P<mode>.+)$"),
    re.compile(r"^Frequency:(?P<frequency>[\d.]+) (?P<frequency_units>.+) \(Channel (?P<channel>\d+)\)$"),
    re.compile(r"^Encryption key:(?P<encryption>.+)$"),
    re.compile(r"^Quality=(?P<signal_quality>\d+)/(?P<signal_total>\d+)\s+Signal level=(?P<signal_level_dBm>.+) d.+$"),
    re.compile(r"^Signal level=(?P<signal_quality>\d+)/(?P<signal_total>\d+).*$"),

    re.compile(r"^Mode:(?P<mode>.+) \sFrequency:(?P<frequency>[\d.]+) (?P<frequency_units>.+) \sAccess Point:\s(?P<mac>.+)$"),
    re.compile(r"^Link Quality=(?P<signal_quality>\d+)/(?P<signal_total>\d+)\s+Signal level=(?P<signal_level_dBm>.+) d.+$"),    
    re.compile(r"^Bit Rate=(?P<bit_rate>.+)  \s+Tx-Power=(?P<tx_power_dbm>.+) d.+$"),    
        
]

wpaRe = re.compile(r"IE:\ WPA\ Version\ 1$")
wpa2Re = re.compile(r"IE:\ IEEE\ 802\.11i/WPA2\ Version\ 1$")


# Indicates the interface operational state, possible values are:
# "unknown", "notpresent", "down", "lowerlayerdown", "testing","dormant", "up"."no such file or directory"
def wifinetworkstatus(interface='wlan0'):
    cmd = ["sudo","cat","/sys/class/net/"+interface+"/operstate"]
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    status = proc.stdout.read().decode('utf-8').rstrip()
    return status


def hostip():
    cmd = ["hostname","-I"]
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    ip = proc.stdout.read().decode('utf-8').rstrip()
    return ip


def wifiscan(interface='wlan0'):
    cmd = ["sudo","iwlist", interface, "scan"]
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    points = proc.stdout.read().decode('utf-8')
    return points


def wifistatus():
    cmd = ["iwconfig"]
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    points = proc.stdout.read().decode('utf-8')
    return points


def wifistatusparse(content):
    cells = []
    lines = content.split('\n')
    for line in lines:
        line = line.strip()
        cellNumber = cellNumberReS.search(line)
        if cellNumber is not None:
            cells.append(cellNumber.groupdict())
            continue
        for expression in regexps:
            result = expression.search(line)
            if result is not None:
                cells[-1].update(result.groupdict())
                cells[0]["network_status"] = str(wifinetworkstatus())
                cells[0]["ip_address"] = str(hostip())
                continue
    return cells[0]     



def wifiparse(content):
    cells = []
    lines = content.split('\n')
    for line in lines:
        line = line.strip()
        cellNumber = cellNumberRe.search(line)
        if cellNumber is not None:
            cells.append(cellNumber.groupdict())
            continue
        wpa = wpaRe.search(line)
        if wpa is not None :
            cells[-1].update({'encryption':'wpa'})
        wpa2 = wpa2Re.search(line)
        if wpa2 is not None :
            cells[-1].update({'encryption':'wpa2'}) 
        for expression in regexps:
            result = expression.search(line)
            if result is not None:
                if 'encryption' in result.groupdict() :
                    if result.groupdict()['encryption'] == 'on' :
                        cells[-1].update({'encryption': 'wep'})
                    else :
                        cells[-1].update({'encryption': 'off'})
                else :
                    cells[-1].update(result.groupdict())
                continue
    return cells


def create_wpa_supplicant(ssid, wifi_key):
    temp_conf_file = open('wpa_supplicant.conf.tmp', 'w')
    temp_conf_file.write('ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev\n')
    temp_conf_file.write('update_config=1\n')
    temp_conf_file.write('\n')
    temp_conf_file.write('network={\n')
    temp_conf_file.write('	ssid="' + ssid + '"\n')
    if wifi_key == '':
        temp_conf_file.write('	key_mgmt=NONE\n')
    else:
        temp_conf_file.write('	psk="' + wifi_key + '"\n')
    temp_conf_file.write('	}')
    temp_conf_file.close
    os.system('sudo mv wpa_supplicant.conf.tmp /etc/wpa_supplicant/wpa_supplicant.conf2')




