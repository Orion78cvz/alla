///////
//簡易点数表

const ron_head = ["副露手一般\n(30符)", "門前手一般\n(40符)", "平和(20符)", "七対子(25符)"];
const tsumo_head = ["一般(30符)", "平和", "七対子", "40符"];

const rows_head = ["1翻", "2翻", "3翻", "4翻", "満貫", "跳満(6,7翻)", "倍満(8～10翻)", "三倍満(11翻～)", "役満", "2倍役満"];

const ron = [[1000, 1300, 1000, null], [2000, 2600, 2000, 1600], [3900, 5200, 3900, 3200], [7700, 8000, 7700, 6400], [8000], [12000], [16000], [24000], [32000], [64000]];

const ron_leader = [[1500, 2000, 1500, null], [2900, 3900, 2600, 2400], [5800, 7700, 5800, 4800], [11600, 12000, 11600, 9600], [12000], [18000], [24000], [36000], [48000], [96000]];

const tsumo = [[[300, 500], null, null, [400, 700]], [[500, 1000], [400, 700], null, [700, 1300]], [[1000, 2000], [700, 1300], [800, 1600], [1300, 2600]], [[2000, 3900], [1300, 2600], [1600, 3200], [2000, 4000]], [[2000, 4000]], [[3000, 6000]], [[4000, 8000]], [[6000, 12000]], [[8000, 16000]], [[16000, 32000]]];

const tsumo_leader = [[[500, 0], null, null, [700, 0]], [[1000, 0], [700, 0], null, [1300, 0]], [[2000, 0], [1300, 0], [1600, 0], [2600, 0]], [[3900, 0], [2600, 0], [3200, 0], [4000, 0]], [[4000, 0]], [[6000, 0]], [[8000, 0]], [[12000, 0]], [[16000, 0]], [[32000, 0]]];

export const score_table = {
    head: {
        ron: ron_head,
        tsumo: tsumo_head,
        rows: rows_head,
    },
    data: {
        ron: {
            player: ron,
            leader: ron_leader,
        },
        tsumo: {
            player: tsumo,
            leader: tsumo_leader,
        },
    },
};
