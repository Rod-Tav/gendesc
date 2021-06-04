window.onload = function () {
    document.getElementById("source").value = `
<tr>
    <td>2020-02-22</td>
    <td><a href = "https://www.youtube.com/watch?v=SIIrUHDdocE" target="_blank">1'21"481</a></td>
    <td><a href = "profile.php?player=Matt">Matt</a></td>
    <td><center><img alt = "Canada" title = "Canada" src = "../country-flags/CA.png"></center></td>
    <td>467</td>
    <td>28.386</td>
    <td>26.632</td>
    <td>26.463</td>
    <td>7-3-0</td>
    <td>1-1-1</td>
    <td>Wario</td>
    <td>Biddybuggy</td>
    <td>Button</td>
    <td>Cloud Glider</td>
</tr>
<tr>
    <td>2021-06-03</td>
    <td>1'21"478</td>
    <td><a href = "profile.php?player=Technical">Technical</a></td>
    <td><center><img alt = "USA" title = "USA" src = "../country-flags/US.png"></center></td>
    <td>1</td>
    <td>28.348</td>
    <td>26.633</td>
    <td>26.497</td>
    <td>7-3-0</td>
    <td>1-1-1</td>
    <td>Wario</td>
    <td>Biddybuggy</td>
    <td>Button</td>
    <td>Parachute</td>
</tr>`;
}

function copy_from_textarea() {
    var temp = document.createElement('textarea');

    temp.value = document.getElementById("description").value;
    temp.selectionStart = 0;
    temp.selectionEnd = temp.value.length;

    var s = temp.style;
    s.position = 'fixed';
    s.left = '-100%';

    document.body.appendChild(temp);
    temp.focus();
    var result = document.execCommand('copy');
    temp.blur();
    document.body.removeChild(temp);
    return result;
}

function clearTextarea() {
    var textareaForm = document.getElementById("source");
    textareaForm.value = '';
}

function main() {
    getRecorder();
    parseText();
    outputDesc();
}

var recorder = "unknown";
var recordList = [];

function getRecorder() {
    recorder = document.getElementById("recorder").value;
}

function parseHTML() {
    var source = document.getElementById("source").value.replace(/\r?\n/g, '');
    document.getElementById("description").value = source;

    var dom_parser = new DOMParser();
    var document_obj = null;
    try {
        document_obj = dom_parser.parseFromString(source, "text/html");
        if (document_obj.getElementsByTagName("parsererror").length) {
            document_obj = null;
        }
    } catch (e) {
    }

    if (document_obj) {
        console.log(document_obj.documentElement);
    }
}

function parseText() {
    var src = document.getElementById("source").value.trim().split(/\n/);
    var ele = [];
    var q = 0;
    var readMode = false;
    for (var p = 0; p < src.length; p++) {
        if (src[p].trim() == "<tr>") {
            if (ele.length == 0) {
                q = 0;
                readMode = true;
            }
        } else if (src[p].trim() == "</tr>") {
            if (ele.length == 14) {
                var rec = new Record(ele[0], ele[1], ele[2], ele[3], ele[5], ele[6], ele[7], ele[8], ele[9], ele[10], ele[11], ele[12], ele[13]);
                recordList.push(rec);
                readMode = false;
                ele = [];
            } else if (ele.length == 15) {
                //continue
            } else if (ele.length == 18) {
                var rec = new BabyParkRecord(ele[0], ele[1], ele[2], ele[3], ele[5], ele[6], ele[7], ele[8], ele[9], ele[10], ele[11], ele[12], ele[13], ele[14], ele[15], ele[16], ele[17]);
                recordList.push(rec);
                readMode = false;
                ele = [];
            }
        } else if (readMode) {
            if (q == 1 || q == 2) {
                if (src[p].trim().match(/<td.*><a .+>.+<\/a><\/td>/)) {
                    ele.push(src[p].trim().match(/<td.*><a .+>(.+)<\/a><\/td>/)[1]);
                } else {
                    ele.push(src[p].trim().match(/<td.*>(.+)<\/td>/)[1]);
                }
            } else if (q == 3) {
                ele.push(src[p].trim().match(/<td.*><center><img alt\s*=\s*\"(.+)\" title.+><\/center><\/td>/)[1]);
            } else {
                ele.push(src[p].trim().match(/<td.*>(.+)<\/td>/)[1]);
            }
            q++;
        }
    }
}

function outputDesc() {
    recordList.slice(-1)[0].setPrevious(recordList[0]);
    document.getElementById("description").value = recordList.slice(-1)[0].printDesc();
}

class Record {
    constructor(a, b, c, d, e, f, g, h, i, j, k, l, m) {
        this.date = new Date(a);
        this.time = b.split(/'|"/).map(Number);
        this.player = c;
        this.nation = d;
        this.lap1 = e;
        this.lap2 = f;
        this.lap3 = g;
        this.shroom = h.split('-');
        this.coin = i.split('-');
        this.driver = j;
        this.vehicle = k;
        this.tires = l;
        this.glider = m;
        this.previousDate = null;
        this.previousTime = [9, 59, 999];
        this.previousPlayer = "unknown";
        this.previousDays = 0;
        this.diff = 0;
    }
    cnvTime(tm) {
        return (tm[0] * 60 + tm[1]) * 1000 + tm[2]
    }
    printTime(tm) {
        return ("0" + tm[0]).slice(-1) + ":" + ("00" + tm[1]).slice(-2) + "." + ("000" + tm[2]).slice(-3);
    }
    printDate(dt) {
        function suffix(x) {
            var y = x % 10,
                z = x % 100;
            if (y == 1 && z != 11) {
                return x + "st";
            }
            if (y == 2 && z != 12) {
                return x + "nd";
            }
            if (y == 3 && z != 13) {
                return x + "rd";
            }
            return x + "th";
        }

        const months = ["January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"];
        var month = months[dt.getMonth()];
        var day = dt.getDate();
        var year = dt.getFullYear();
        return month + " " + suffix(day) + ", " + year;
    }
    printDesc() {
        var desc = `Date: ${this.printDate(this.date)}
${this.diff} improvement over previous WR: ${this.printTime(this.previousTime)} by ${this.previousPlayer} on ${this.printDate(this.previousDate)} ${this.previousDays}

Combo: ${this.driver} / ${this.vehicle} / ${this.tires} / ${this.glider}
Splits: ${this.lap1} - ${this.lap2} - ${this.lap3}
Mushrooms: ${this.shroom[0]} - ${this.shroom[1]} - ${this.shroom[2]}
Coins: ${this.coin[0]} - ${this.coin[1]} - ${this.coin[2]}

Player's WR profile: https://mkwrs.com/mk8dx/profile.php?player=${this.player}

See all the current and past WRs for MK8DX at : https://mkwrs.com/mk8dx
See various top 10 leaderboards for MK8DX at : http://mkleaderboards.com/
Discuss Time Trials in the MKLeaderboards Discord server! : https://discord.gg/NHrtWQq

Enter the MK8DX time trial competition at : http://www.mariokartplayers.com/mk8
Join the MK8DX online competitive scene at : http://www.mariokartcentral.com/

If you want to watch WR videos for the Wii U version of MK8, refer to: https://www.youtube.com/user/MK8Records

Recorded by ${recorder}`;
        return desc;
    }
    setPrevious(rec) {
        this.previousDate = rec.date;
        var last = (this.date - this.previousDate) / 86400000;
        if (last > 1) {
            this.previousDays = "(lasted " + last + " days)";
        } else if (last == 1) {
            this.previousDays = "(lasted " + last + " day)";
        } else if (this.previousDays == 0) {
            this.previousDays = "on the same day";
        } else {
            this.previousDays = "?";
        }
        this.previousTime = rec.time;
        var diff = this.cnvTime(this.previousTime) - this.cnvTime(this.time);
        this.diff = parseInt(diff / 1000, 10) + "." + ("000" + diff % 1000).slice(-3);
        this.previousPlayer = (this.player == rec.player ? "the same player" : rec.player);
    }

}

class BabyParkRecord extends Record {
    constructor(a, b, c, d, l1, l2, l3, l4, l5, l6, l7, h, i, j, k, l, m) {
        super(null, "0\'00\"000", null, null, null, null, null, "0-0-0", "0-0-0", null, null, null, null, null);
        this.date = new Date(a);
        this.time = b.split(/'|"/).map(Number);
        this.player = c;
        this.nation = d;
        this.lap1 = l1;
        this.lap2 = l2;
        this.lap3 = l3;
        this.lap4 = l4;
        this.lap5 = l5;
        this.lap6 = l6;
        this.lap7 = l7;
        this.shroom = h.split('-');
        this.driver = i;
        this.vehicle = j;
        this.coin = k.split('-');
        this.tires = l;
        this.glider = m;
        this.previousDate = null;
        this.previousTime = [9, 59, 999];
        this.previousPlayer = "unknown";
        this.previousDays = 0;
        this.diff = 0;
    }
    printDesc() {
        var desc = `Date: ${this.printDate(this.date)}
${this.diff} improvement over previous WR: ${this.printTime(this.previousTime)} by ${this.previousPlayer} on ${this.printDate(this.previousDate)} ${this.previousDays}

Combo: ${this.driver} / ${this.vehicle} / ${this.tires} / ${this.glider}
Splits: ${this.lap1} - ${this.lap2} - ${this.lap3} - ${this.lap4} - ${this.lap5} - ${this.lap6} - ${this.lap7}
Mushrooms: ${this.shroom[0]} - ${this.shroom[1]} - ${this.shroom[2]} - ${this.shroom[3]} - ${this.shroom[4]} - ${this.shroom[5]} - ${this.shroom[6]}
Coins: ${this.coin[0]} - ${this.coin[1]} - ${this.coin[2]} - ${this.coin[3]} - ${this.coin[4]} - ${this.coin[5]} - ${this.coin[6]}

Player's WR profile: https://mkwrs.com/mk8dx/profile.php?player=${this.player}

See all the current and past WRs for MK8DX at : https://mkwrs.com/mk8dx
See various top 10 leaderboards for MK8DX at : http://mkleaderboards.com/
Discuss Time Trials in the MKLeaderboards Discord server! : https://discord.gg/NHrtWQq

Enter the MK8DX time trial competition at : http://www.mariokartplayers.com/mk8
Join the MK8DX online competitive scene at : http://www.mariokartcentral.com/

If you want to watch WR videos for the Wii U version of MK8, refer to: https://www.youtube.com/user/MK8Records

Recorded by ${recorder}`;
        return desc;
    }
}