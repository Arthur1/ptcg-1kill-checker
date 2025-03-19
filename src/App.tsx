import { type ChangeEventHandler, useCallback, useState } from "react";
import { combinationsDependencies, create } from "mathjs";

const { combinations } = create({ combinationsDependencies });

const DECK_SIZE = 60;

const normalizeNumber = (str: string): string =>
  str.replace(/[０-９]/g, (match) =>
    String.fromCharCode(match.charCodeAt(0) - 0xff10 + 0x30)
  );

const validateHpThreshold = (hpThreshold: number): string | undefined => {
  if (isNaN(hpThreshold)) return "数値を入力してください";
  if (hpThreshold < 0) return "0以上の整数を入力してください";
  return undefined;
};

const validatePokemons = (pokemons: number): string | undefined => {
  if (isNaN(pokemons)) return "数値を入力してください";
  if (pokemons < 0) return "0以上の整数を入力してください";
  if (pokemons > DECK_SIZE) return `${DECK_SIZE}以下の整数を入力してください`;
  return undefined;
};

const validateTotalCards = (totalCards: number): string | undefined => {
  if (totalCards > DECK_SIZE)
    return `デッキの合計枚数が${DECK_SIZE}を超えています`;
  return undefined;
};

const calcProbability = (
  lowHpBasicPokemons: number,
  otherCards: number
): number => {
  if (isNaN(lowHpBasicPokemons) || isNaN(otherCards)) return NaN;
  if (lowHpBasicPokemons < 1 || otherCards < 6) return 0;

  const numerator =
    combinations(lowHpBasicPokemons, 1) * combinations(otherCards, 6);
  const denominator = combinations(DECK_SIZE, 7) - combinations(otherCards, 7);
  if (denominator === 0) return NaN;

  return numerator / denominator;
};

export default function App() {
  const [hpThresholdStr, setHpThresholdStr] = useState("80");
  const [lowHpBasicPokemonsStr, setLowHpBasicPokemonsStr] = useState("7");
  const [highHpBasicPokemonsStr, setHighHpBasicPokemonsStr] = useState("5");

  const handleChangeHpThresholdInput: ChangeEventHandler<HTMLInputElement> =
    useCallback((e) => {
      setHpThresholdStr(e.currentTarget.value);
    }, []);
  const handleChangeLowHpBasicPokemonsInput: ChangeEventHandler<HTMLInputElement> =
    useCallback((e) => {
      setLowHpBasicPokemonsStr(e.currentTarget.value);
    }, []);
  const handleChangeHighHpBasicPokemonsInput: ChangeEventHandler<HTMLInputElement> =
    useCallback((e) => {
      setHighHpBasicPokemonsStr(e.currentTarget.value);
    }, []);

  const hpThreshold = parseInt(normalizeNumber(hpThresholdStr));
  const lowHpBasicPokemons = parseInt(normalizeNumber(lowHpBasicPokemonsStr));
  const highHpBasicPokemons = parseInt(normalizeNumber(highHpBasicPokemonsStr));
  const otherCards = Math.max(
    DECK_SIZE - lowHpBasicPokemons - highHpBasicPokemons,
    0
  );
  const totalCards = lowHpBasicPokemons + highHpBasicPokemons + otherCards;

  const hpThresholdError = validateHpThreshold(hpThreshold);
  const lowHpBasicPokemonsError = validatePokemons(lowHpBasicPokemons);
  const highHpBasicPokemonsError = validatePokemons(highHpBasicPokemons);
  const totalCardsError = validateTotalCards(totalCards);

  const probability = calcProbability(lowHpBasicPokemons, otherCards);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-3xl mx-auto w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
            ポケモンカード
            <br />
            ワンキル確率計算機
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            初期手札がHPが一定以下のたねポケモン1枚だけである確率を計算します。
          </p>
          <p className="text-slate-300 max-w-2xl mx-auto">
            負けるのは相手がブン回っているからではなく、あなたのデッキのワンキル耐性が低いからかもしれません……
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-slate-700">
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <h2 className="text-xl font-medium text-slate-200 border-b border-slate-700 pb-2">
                  パラメータ
                </h2>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    HPしきい値
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={hpThresholdStr}
                    onChange={handleChangeHpThresholdInput}
                    className={`w-full px-4 py-2.5 bg-slate-700 border ${
                      hpThresholdError ? "border-red-500" : "border-slate-600"
                    } rounded-lg text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all`}
                  />
                  {hpThresholdError && (
                    <p className="mt-1 text-xs text-red-400">
                      {hpThresholdError}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    確率の計算結果には関係ありません。わかりやすい表示のために設定するものです
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    HP{hpThreshold}以下のたねポケモンの枚数
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={lowHpBasicPokemonsStr}
                    onChange={handleChangeLowHpBasicPokemonsInput}
                    className={`w-full px-4 py-2.5 bg-slate-700 border ${
                      lowHpBasicPokemonsError || totalCardsError
                        ? "border-red-500"
                        : "border-slate-600"
                    } rounded-lg text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all`}
                  />
                  {lowHpBasicPokemonsError && (
                    <p className="mt-1 text-xs text-red-400">
                      {lowHpBasicPokemonsError}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    HP{hpThreshold}より大きいたねポケモンの枚数
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={highHpBasicPokemonsStr}
                    onChange={handleChangeHighHpBasicPokemonsInput}
                    className={`w-full px-4 py-2.5 bg-slate-700 border ${
                      highHpBasicPokemonsError || totalCardsError
                        ? "border-red-500"
                        : "border-slate-600"
                    } rounded-lg text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all`}
                  />
                  {highHpBasicPokemonsError && (
                    <p className="mt-1 text-xs text-red-400">
                      {highHpBasicPokemonsError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    それ以外のカード枚数
                  </label>
                  <div className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white">
                    {otherCards}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">自動計算</p>
                </div>
                <div className="flex flex-col px-4 py-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">
                      合計: {totalCards} 枚
                    </span>
                  </div>
                  {totalCardsError && (
                    <p className="mt-1 text-xs text-red-400">
                      {totalCardsError}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-xl p-6 flex flex-col justify-center">
                <h2 className="text-xl font-medium text-slate-200 mb-4">
                  計算結果
                </h2>

                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center p-6 bg-slate-800/80 rounded-lg">
                    <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
                      {isNaN(probability) ||
                      lowHpBasicPokemonsError ||
                      highHpBasicPokemonsError ||
                      totalCardsError
                        ? "---"
                        : (probability * 100).toFixed(2) + "%"}
                    </div>
                    <p className="mt-2 text-sm text-slate-300 text-center">
                      {DECK_SIZE}
                      枚のデッキから7枚引いてたねポケモンが1枚以上あるとき、それがHP
                      {hpThreshold}
                      以下のたねポケモンちょうど1枚である条件つき確率
                    </p>
                  </div>

                  <div className="mt-4 text-xs text-slate-400 space-y-1 bg-slate-800/50 p-4 rounded-lg">
                    <p className="font-medium">
                      計算式: [C(a,1) × C(c,6)] / [C({DECK_SIZE},7) - C(c,7)]
                    </p>
                    <p>
                      a = HP{hpThreshold}以下のたねポケモンの枚数:{" "}
                      {lowHpBasicPokemons}
                    </p>
                    <p>
                      b = HP{hpThreshold}より大きいたねポケモンの枚数:{" "}
                      {highHpBasicPokemons}
                    </p>
                    <p>c = それ以外のカード枚数: {otherCards}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 今後の展望と利用規約 */}
        <div className="mt-8 mb-6 bg-slate-800/30 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-slate-700">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 今後の展望 */}
              <div>
                <h3 className="text-lg font-medium text-slate-200 border-b border-slate-700 pb-2 mb-4">
                  今後の展望
                </h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start">
                    <span className="text-pink-500 mr-2">•</span>
                    <span>相手のマリガン率を考慮した計算</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-pink-500 mr-2">•</span>
                    <span>HPごとの相手のワンキル成功率を考慮した計算</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-pink-500 mr-2">•</span>
                    <span>デッキコードからの計算</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-200 border-b border-slate-700 pb-2 mb-4">
                  利用規約
                </h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    <span>計算結果の正確性は保証しません</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    <span>
                      本ツールの利用に関連して利用者もしくは第三者に生じた損害について、その賠償の責任を一切負いかねます
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    <span>
                      本ツールを安定して運用できるよう努力をいたしますが、100%の稼働を保証しません。予告なくサービスを一時停止、終了することがあります
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    <span>
                      本ツールは非公式のものであり、株式会社ポケモン・株式会社ゲームフリーク・株式会社クリーチャーズとは無関係です
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-slate-500">
          <small>
            &copy; 2025{" "}
            <a
              href="https://x.com/Arthur1__"
              className="text-blue-400 hover:text-blue-300 hover:underline transition-colors cursor-pointer"
            >
              Arthur
            </a>
          </small>
          <br />
          <small>
            Repository:{" "}
            <a
              href="https://github.com/Arthur1/ptcg-1kill-checker"
              className="text-blue-400 hover:text-blue-300 hover:underline transition-colors cursor-pointer"
            >
              github.com/Arthur1/ptcg-1kill-checker
            </a>
          </small>
        </div>
      </div>
    </div>
  );
}
