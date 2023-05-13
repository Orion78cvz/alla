import score_table from "./score_table.json" assert { type: 'json' };

///////
//
//
class PlayerInfo {
    name;
    isLeader; //親かどうか
    scoreCurrent; //本局開始時のスコア
    pointCurrent; //前半荘までのポイント
    scoreResult; //本局終了時のスコア
    pointResult; //半荘終了時のポイント
    rankScoreResult; //本局終了時のスコア順位
    rankPointResult; //半荘終了時のポイント順位
    initialSeat; //起家(0)からの席順
    stateInReach; //立直宣言しているかどうか

    constructor(name, init_seat, score, point) {
        this.name = name;
        this.initialSeat = init_seat;
        this.isLeader = (init_seat == 3); //memo: 人数固定
        this.scoreCurrent = score;
        this.pointCurrent = point;
        this.stateInReach = false;
    }
}

///////
//
//
const VueApp = {
    //-- variables--
    data() {
        return {
            txtErrorMsg: "",

            initial_score: 25000, //配給原点
            origin_score: 30000, //清算原点
            bonus_point_snd: 5, //ウマ
            bonus_point_fst: 15, //ウマ

            players: [
                new PlayerInfo("自分", 2, 20000, 0),
                new PlayerInfo("下家", 3, 35000, 0),
                new PlayerInfo("対面", 0, 30000, 0),
                new PlayerInfo("上家", 1, 15000, 0)],

            is_4th_round: true, //東4局or南4局 (起家を親に連動させる)
            player_positions_label: ["me", "right", "opposite", "left"],

            score_table: score_table,

            potStack: 0, //積み棒
            potReach: 0, //立直棒(キャリーオーバー分のみで今の局に出た分は含まない)

            scoreTsumo: 2000,
            scoreTsumoFromLeader: 4000,

            scoreRon: 3900,
            playerRonFrom: 1,

            labelCalcType: "",
            listScoreDiff: [],
        }
    },

    //-- methods--
    methods: {

        //--- 条件計算

        procDrawn() {
            //todo: 聴牌料計算
            let br = this.potReach * 1000;
            for (let i = 0; i < 4; i++) {
                this.players[i].scoreResult = this.players[i].scoreCurrent;
                if (this.players[i].stateInReach) { //todo: ここは別途聴牌状態のフラグを持たせる
                    this.players[i].scoreResult -= 1000;
                    br += 1000;
                }
            }
            //未回収の立直棒はトップ者に加算する (memo: 得点に加算するより結果のポイントに加算した方が良いかもしれない)
            let tp = this.calcScoreRanking();
            tp.scoreResult += br;

            this.calcPoints();

            this.labelCalcType = "流局";
            this.outputScoreDifference();
        },
        procRon() {
            //info: ダブロンはひとまず非対応
            this.players[0].scoreResult = this.players[0].scoreCurrent + this.scoreRon + this.potReach * 1000 + this.potStack * 300;
            for (let i = 1; i < 4; i++) {
                this.players[i].scoreResult = this.players[i].scoreCurrent;
                if (this.players[i].stateInReach) {
                    this.players[i].scoreResult -= 1000;
                    this.players[0].scoreResult += 1000;
                }
            }
            this.players[this.playerRonFrom].scoreResult = this.players[this.playerRonFrom].scoreResult - this.scoreRon - this.potStack * 300;

            this.calcPoints();

            this.labelCalcType = "ロン";
            this.outputScoreDifference();
        },
        procTsumo() {
            this.players[0].scoreResult = this.players[0].scoreCurrent + this.potReach * 1000 + this.potStack * 300;
            for (let i = 1; i < 4; i++) {
                let c = this.players[i].isLeader ? this.scoreTsumoFromLeader : this.scoreTsumo;
                this.players[i].scoreResult = this.players[i].scoreCurrent - c - this.potStack * 100;
                this.players[0].scoreResult = this.players[0].scoreResult + c;
                if (this.players[i].stateInReach) {
                    this.players[i].scoreResult -= 1000;
                    this.players[0].scoreResult += 1000;
                }
            }
            this.calcPoints();

            this.labelCalcType = "ツモ";
            this.outputScoreDifference();
        },

        //ポイント、順位計算
        calcPoints() {
            this.checkTotalScore();
            this.calcScoreRanking();

            let puma = [this.bonus_point_fst, this.bonus_point_snd, -this.bonus_point_snd, -this.bonus_point_fst];
            let soka = [(this.origin_score - this.initial_score) * 4, 0, 0, 0];
            for (let pl of this.players) {
                let s = pl.scoreResult + puma[pl.rankScoreResult] * 1000 + soka[pl.rankScoreResult] - this.origin_score;
                pl.pointResult = pl.pointCurrent + s / 1000;
            }

            this.calcPointRanking();
        },
        calcScoreRanking() {
            let sorted = this.players.slice().sort((a, b) => (b.scoreResult - b.initialSeat) - (a.scoreResult - a.initialSeat));
            for (let i = 0; i < 4; i++) { sorted[i].rankScoreResult = i; }
            return sorted[0];
        },
        calcPointRanking() {
            //todo: 同点先着有利の処理
            let sorted = this.players.slice().sort((a, b) => b.pointResult - a.pointResult);
            for (let i = 0; i < 4; i++) { sorted[i].rankpointResult = i; }
        },
        setInitialSeat(init_leader) {
            for (let i = 0; i < this.players.length; i++) {
                this.players[i].initialSeat = (i - init_leader + this.players.length) % this.players.length;
            }
        },

        //点数変動を計算
        outputScoreDifference() {
            this.listScoreDiff.splice(0);
            for (let pl of this.players) {
                let d = pl.scoreResult - pl.scoreCurrent;
                if (d == 0) continue;
                this.listScoreDiff.push([pl.name, (d > 0 ? "+" : "") + d.toString()]);
            }
        },

        //--- validation

        checkTotalScore() {
            this.txtErrorMsg = "";
            let init = this.initial_score * 4;
            let cur = this.players.reduce((sum, pl) => sum + pl.scoreCurrent, this.potReach * 1000);
            if (init != cur) {
                this.txtErrorMsg = "持ち点の合計が初期状態と相違しています";
            }
        },
        //TODO: <input>が空欄等になっている場合の処理

        //--- その他UI

        onChangeLeader(pi) {
            //todo: この辺りの操作は結果を非表示に戻したい
            for (let pl of this.players) { pl.isLeader = false; }
            this.players[pi].isLeader = true;

            if (this.is_4th_round) {
                this.setInitialSeat((pi + 1) % this.players.length);
            }
        },
        onChangeInitialLeader(pi) {
            if (!this.is_4th_round) {
                if (pi !== null) this.setInitialSeat(pi);
            } else if (pi === null) { //親に連動させる
                for (let l = 0; l < this.players.length; l++) {
                    if (this.players[l].isLeader) {
                        //this.onChangeLeader(l);
                        this.setInitialSeat((l + 1) % this.players.length);
                        break;
                    }
                }
            }
        },
        setScoreRon(score, runproc) {
            if (score) {
                this.scoreRon = score;
            }
            if (runproc) this.procRon();
        },
        setScoreTsumo(scores, runproc) {
            if (scores) {
                this.scoreTsumo = scores[0];
                this.scoreTsumoFromLeader = scores[1];
            }
            if (runproc) this.procTsumo();
        },
        formatPointResult(num) {
            return (num > 0 ? "+" : "") + num.toFixed(1);
        },


    }
};

Vue.createApp(VueApp).mount('#app');
