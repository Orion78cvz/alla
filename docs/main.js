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

    constructor(name, is_leader, score, point) {
        this.name = name;
        this.isLeader = is_leader;
        this.scoreCurrent = score;
        this.pointCurrent = point;
    }
}

///////
//
//
const VueApp = {
    //-- variables--
    data() {
        return {
            error_msg: "",

            initial_score: 25000, //配給原点
            origin_score: 30000, //清算原点
            bonus_point_snd: 5, //ウマ
            bonus_point_fst: 15, //ウマ

            players: [
                new PlayerInfo("自分", false, 20000, 0),
                new PlayerInfo("下家", false, 35000, 0),
                new PlayerInfo("対面", false, 30000, 0),
                new PlayerInfo("上家", true, 15000, 0)],
            player_positions: ["me", "right", "opposite", "left"],

            potStack: 0, //積み棒
            potReach: 0, //立直棒(キャリーオーバー分のみ)

            scoreTsumo: 2000,
            scoreTsumoFromLeader: 4000,

            scoreRon: 3900,
            playerRonFrom: 1,
        }
    },

    //-- methods--
    methods: {

        //--- 条件計算
        procDrawn() {
            //todo: 聴牌料計算
            for (let i = 0; i < 4; i++) {
                this.players[i].scoreResult = this.players[i].scoreCurrent;
            }
            this.calcPoints();
        },
        procRon() {
            this.players[0].scoreResult = this.players[0].scoreCurrent + this.scoreRon + this.potReach * 1000 + this.potStack * 300;
            for (let i = 1; i < 4; i++) {
                this.players[i].scoreResult = this.players[i].scoreCurrent;
            }
            this.players[this.playerRonFrom].scoreResult = this.players[this.playerRonFrom].scoreResult - this.scoreRon - this.potStack * 300;

            this.calcPoints();
        },
        procTsumo() {
            this.players[0].scoreResult = this.players[0].scoreCurrent + this.potReach * 1000 + this.potStack * 300;
            for (let i = 1; i < 4; i++) {
                let c = this.players[i].isLeader ? this.scoreTsumoFromLeader : this.scoreTsumo;
                this.players[i].scoreResult = this.players[i].scoreCurrent - c - this.potStack * 100;
                this.players[0].scoreResult = this.players[0].scoreResult + c;
            }
            console.log(this.players);
            this.calcPoints();
        },

        //--- ポイント計算
        calcPoints() {
            this.checkTotalScore();
            this.calcScoreRanking();

            let puma = [this.bonus_point_fst, this.bonus_point_snd, -this.bonus_point_snd, -this.bonus_point_fst];
            let soka = [(this.origin_score - this.initial_score) * 4, 0, 0, 0];
            for (let pl of this.players) {
                let s = pl.scoreResult + puma[pl.rankScoreResult] * 1000 + soka[pl.rankScoreResult] - this.origin_score;
                pl.pointResult = pl.pointCurrent + s / 1000;
            }
        },
        calcScoreRanking() {
            //todo: 同点起家有利の処理 (比較時スコアに起家から3,2,1,0加算すればよさそう)
            let sorted = this.players.slice().sort((a, b) => b.scoreResult - a.scoreResult);
            for (let i = 0; i < 4; i++) { sorted[i].rankScoreResult = i; }
        },

        //--- validation
        checkTotalScore() {
            let init = this.initial_score * 4;
            let cur = this.players.reduce((sum, pl) => sum + pl.scoreCurrent, this.potReach * 1000);
            if (init != cur) {
                this.error_msg = "持ち点の合計が初期状態と相違しています";
            } else {
                this.error_msg = "";
            }
        },

        //--- その他UI
        onChangeLeader(pi) {
            for (let pl of this.players) { pl.isLeader = false; }
            this.players[pi].isLeader = true;
        },
        formatPointResult(num) {
            return (num > 0 ? "+" : "") + num.toFixed(1);
        },

    }
};

Vue.createApp(VueApp).mount('#app');
