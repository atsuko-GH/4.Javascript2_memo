// ============================================
// 夢日記 JavaScript
// 一緒に、上から順番に書いていこう！
// ============================================

// STEP 1：最初から用意しておく選択肢（場所・登場人物・出来事）
const defaultOptions = {
    places: ["家", "学校", "職場", "街", "海", "山", "知らない場所", "その他"],
    people: ["自分", "家族", "友達", "恋人", "同僚", "有名人", "知らない人", "動物", "その他"],
    events: ["追いかけられる", "空を飛ぶ", "落ちる", "迷う", "食べる", "その他"]
};

// STEP 2：localStorage から「dreams」と「customOptions」を読み込む
let dreams = JSON.parse(localStorage.getItem("dreams")) || []; // 保存された夢の記録があれば読み込みます。なければ、空の配列 [] から始めます。
let customOptions = JSON.parse(localStorage.getItem("customOptions")) || { places: [], people: [], events: [] }; // 保存されたカスタム選択肢があれば読み込みます。なければ、場所・登場人物・出来事がすべて空っぽの状態から始めます。

// STEP 3：日付の入力欄に、今日の日付を入れる
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1;
const day = today.getDate();

const todayText = year + "-" + String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0");
document.getElementById("dream-date").value = todayText;

// STEP 4：気分・星・睡眠の質のボタンを押したら選ばれるようにする
let selectedMood = "";   // 選ばれた気分を覚えておく変数

const moodButtons = document.querySelectorAll(".mood-btn");

moodButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        // ① まず全部のボタンから selected を外す
        moodButtons.forEach(function (b) {
            b.classList.remove("selected");
        });

        // ② 押したボタンだけに selected をつける
        button.classList.add("selected");

        // ③ 選ばれた気分を覚えておく
        selectedMood = button.dataset.value;
    });
});

let selectedSleep = "";   // 選ばれた睡眠の質を覚えておく変数

const sleepOptions = document.querySelectorAll(".sleep-btn");

sleepOptions.forEach(function (button) {
    button.addEventListener("click", function () {
        // ① まず全部のボタンから selected を外す
        sleepOptions.forEach(function (b) {
            b.classList.remove("selected");
        });

        // ② 押したボタンだけに selected をつける
        button.classList.add("selected");

        // ③ 選ばれた睡眠の質を覚えておく
        selectedSleep = button.dataset.value;
    });
});

let selectedClarity = 0;   // 選ばれた鮮明さ（1〜5）を覚えておく変数

const stars = document.querySelectorAll(".star");

stars.forEach(function (button) {
    button.addEventListener("click", function () {
        // 押した星の番号を覚えておく（文字なので Number で数字にする）
        selectedClarity = Number(button.dataset.value);

        // 1つ1つの星を見て、色をつけるか外すか決める
        stars.forEach(function (s) {
            if (Number(s.dataset.value) <= selectedClarity) {
                s.classList.add("active");
            } else {
                s.classList.remove("active");
            }
        });
    });
});

// STEP 5：場所・登場人物・出来事の選択肢ボタンをJSで作る
function renderOptions(category, boxId) {
    const box = document.getElementById(boxId);
    box.innerHTML = "";   // 作り直すときのために、いったん空にする

    // ボタンを1つ作る（isCustom が true なら緑のボタン）
    function makeButton(text, isCustom) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = text;
        button.dataset.value = text;   // 本当の言葉を覚えておく（×がついても読めるように）
        button.classList.add("option-btn");
        if (isCustom) {
            button.classList.add("custom");

            // ×ボタン（自分で追加した選択肢を削除する）
            const removeMark = document.createElement("span");
            removeMark.textContent = "×";
            removeMark.classList.add("remove-tag");

            removeMark.addEventListener("click", function (event) {
                event.stopPropagation();   // 外側のボタンに「押された」を伝えない

                showConfirm(`「${text}」を選択肢から削除しますか？`, function () {
                    const position = customOptions[category].indexOf(text);
                    customOptions[category].splice(position, 1);
                    localStorage.setItem("customOptions", JSON.stringify(customOptions));
                    renderOptions(category, boxId);
                    renderFilter();
                });
            });
            button.appendChild(removeMark);   // ×をボタンの中に入れる
        }
        button.addEventListener("click", function () {
            button.classList.toggle("selected");
        });
        box.appendChild(button);
    }

    // 最初から用意した選択肢
    defaultOptions[category].forEach(function (text) {
        makeButton(text, false);
    });

    // 自分で追加した選択肢（緑）
    customOptions[category].forEach(function (text) {
        makeButton(text, true);
    });
}

// 3つの箱にボタンを並べる
renderOptions("places", "place-options");
renderOptions("people", "people-options");
renderOptions("events", "event-options");

// STEP 6：「＋追加」で選択肢を増やして、customOptions に保存する
const addButtons = document.querySelectorAll(".add-btn");

addButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const form = button.nextElementSibling;   // すぐ次の入力欄
        form.classList.toggle("hidden");             // 押すたびに出す／隠すを切りかえ
    });
});

// どのデータの束を、どの箱に並べるかの対応表
const boxIds = {
    places: "place-options",
    people: "people-options",
    events: "event-options"
};

const submitButtons = document.querySelectorAll(".add-submit");

submitButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const form = button.parentElement;              // 入力欄の箱
        const input = form.querySelector(".add-input");  // 入力欄
        const category = form.dataset.category;         // "places" など
        const text = input.value.trim();                // 入力された文字

        // ② 空っぽなら何もしない
        if (text === "") {
            return;
        }

        // ③ customOptions に追加する
        customOptions[category].push(text);

        // ④ localStorage に保存する
        localStorage.setItem("customOptions", JSON.stringify(customOptions));

        // ⑤ ボタンを作り直して、入力欄を空にして隠す
        renderOptions(category, boxIds[category]);
        renderFilter();
        input.value = "";
        form.classList.add("hidden");
    });
});

// STEP 7：「記録する」で夢を1つのオブジェクトにまとめて dreams に保存する
// 箱の中で選ばれているボタンの文字を、配列にして返す
function getSelected(boxId) {
    const box = document.getElementById(boxId);
    const selectedButtons = box.querySelectorAll("button.selected");
    const result = [];

    selectedButtons.forEach(function (button) {
        result.push(button.dataset.value);   // ボタンが覚えている本当の言葉
    });

    return result;
}

document.getElementById("save-btn").addEventListener("click", function () {

    // 気分が選ばれていなかったら、お知らせして止める
    if (selectedMood === "") {
        showAlert("夢の気分を選んでね");
        return;
    }

    // ① 夢1件分を、1つのオブジェクトにまとめる
    const dream = {
        date: document.getElementById("dream-date").value,
        mood: selectedMood,
        clarity: selectedClarity,
        places: getSelected("place-options"),
        people: getSelected("people-options"),
        events: getSelected("event-options"),
        sleep: selectedSleep,
        memo: document.getElementById("dream-memo").value.trim()
    };

    // ② dreams 配列に追加して、localStorage に保存する
    dreams.push(dream);
    localStorage.setItem("dreams", JSON.stringify(dreams));
    renderList();
    showAlert("記録しました 🌙");
});

// STEP 8：夢の一覧を表示する（削除ボタンつき）
function renderList() {
    const list = document.getElementById("dream-list");
    list.innerHTML = "";   // いったん空にする
    let shownCount = 0;    // 表示した数（最初は0）

    dreams.forEach(function (dream, index) {
        // 場所・人・出来事をまとめる
        const allTags = dream.places.concat(dream.people, dream.events);

        // 絞り込み：選んだタグを持っていない夢は飛ばす
        const filterValue = document.getElementById("filter-select").value;
        if (filterValue !== "" && !allTags.includes(filterValue)) {
            return;
        }

        // タグのHTMLを作る
        let tagsHtml = "";
        allTags.forEach(function (tag) {
            tagsHtml += `<span class="tag">${tag}</span>`;
        });

        // 星の数だけ ★、残りは ☆
        const stars = "★".repeat(dream.clarity) + "☆".repeat(5 - dream.clarity);

        // カードを作る
        const li = document.createElement("li");
        li.classList.add("dream-card");
        li.innerHTML = `
      <div class="dream-header">
        <span class="dream-date">${dream.date}</span>
        <span class="dream-mood">${dream.mood}</span>
        <span class="dream-stars">${stars}</span>
        <span>${dream.sleep}</span>
      </div>
      <div class="dream-tags">${tagsHtml}</div>
      <p class="dream-memo">${dream.memo || "（メモなし）"}</p>
      <button type="button" class="delete-btn" data-index="${index}">削除</button>
    `;

        // 削除ボタンを押したとき
        const deleteBtn = li.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", function () {
            showConfirm("この夢の記録を削除しますか？", function () {
                dreams.splice(index, 1);
                localStorage.setItem("dreams", JSON.stringify(dreams));
                renderList();
            });
        });

        // カードを箱に入れて、数を1つ増やす
        list.appendChild(li);
        shownCount++;
    });

    // 件数を表示
    document.getElementById("dream-count").textContent = shownCount;
    renderAllRankings();
    renderCalendar();
}

renderList();   // ページを開いたときに表示

// STEP 9：絞り込み
function renderFilter() {
    const select = document.getElementById("filter-select");
    select.innerHTML = '<option value="">すべて</option>';   // 「すべて」だけに戻す

    ["places", "people", "events"].forEach(function (category) {
        // 最初から用意した選択肢 ＋ 自分で追加した選択肢
        const all = defaultOptions[category].concat(customOptions[category]);

        all.forEach(function (text) {
            const option = document.createElement("option");
            option.value = text;
            option.textContent = text;
            select.appendChild(option);
        });
    });
}

renderFilter();

document.getElementById("filter-select").addEventListener("change", function () {
    renderList();
});

// STEP 10：カレンダーとランキング
// 数えて、多い順に <ol> に表示する関数
function renderRanking(items, olId) {
    // ① 数える
    const counts = {};
    items.forEach(function (item) {
        counts[item] = (counts[item] || 0) + 1;
    });

    // ② 多い順に並べる（上位3つまで）
    const sorted = Object.entries(counts)
        .sort(function (a, b) { return b[1] - a[1]; })
        .slice(0, 3);

    // ③ 表示する
    const ol = document.getElementById(olId);
    ol.innerHTML = "";
    sorted.forEach(function (pair) {
        const li = document.createElement("li");
        li.textContent = `${pair[0]} … ${pair[1]}回`;
        ol.appendChild(li);
    });

    if (sorted.length === 0) {
        ol.innerHTML = "<li>まだ記録がありません</li>";
    }
}

function renderAllRankings() {
    // 気分を全部集める
    const moods = [];
    dreams.forEach(function (dream) {
        moods.push(dream.mood);
    });
    renderRanking(moods, "mood-ranking");

    // 登場人物を全部集める（1つの夢に複数いるので concat でつなげる）
    let people = [];
    dreams.forEach(function (dream) {
        people = people.concat(dream.people);
    });
    renderRanking(people, "people-ranking");
}

renderAllRankings();

//カレンダーを作る
function renderCalendar() {
    const calendar = document.getElementById("dream-calendar");
    calendar.innerHTML = "";

    // タイトル
    document.getElementById("calendar-title").textContent = `${month}月の夢カレンダー`;

    const firstDay = new Date(year, month - 1, 1).getDay();   // 1日の曜日
    const lastDate = new Date(year, month, 0).getDate();      // 月の最後の日

    // ① 1日の曜日の数だけ、空きマスを入れる
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.classList.add("calendar-cell", "empty");
        calendar.appendChild(empty);
    }

    // ② 1日〜最後の日までのマスを入れる
    for (let d = 1; d <= lastDate; d++) {
        // その日の日付を "2026-11-05" の形にする（STEP 3 と同じ）
        const dateText = year + "-" + String(month).padStart(2, "0") + "-" + String(d).padStart(2, "0");

        // ③ その日の夢を探す
        const dream = dreams.find(function (x) {
            return x.date === dateText;
        });

        const cell = document.createElement("div");
        cell.classList.add("calendar-cell");
        if (dream) {
            cell.classList.add("has-dream");
            cell.innerHTML = `${d}<span class="cell-emoji">${dream.mood}</span>`;
        } else {
            cell.textContent = d;
        }
        calendar.appendChild(cell);
    }
}

// ===== ポップアップ（alert / confirm のかわり） =====
let modalOkAction = null;   // OK が押されたらやること（なければ null）

// お知らせを出す（alert のかわり）
function showAlert(message) {
    document.getElementById("modal-message").textContent = message;
    document.getElementById("modal-cancel").classList.add("hidden");   // 「やめる」は隠す
    modalOkAction = null;
    document.getElementById("modal").classList.remove("hidden");
}

// 確認を出す（confirm のかわり）
function showConfirm(message, onOk) {
    document.getElementById("modal-message").textContent = message;
    document.getElementById("modal-cancel").classList.remove("hidden"); // ① 「やめる」を出す
    modalOkAction = onOk;                                               // ② やることを覚えておく
    document.getElementById("modal").classList.remove("hidden");
}

// OK を押したとき
document.getElementById("modal-ok").addEventListener("click", function () {
    document.getElementById("modal").classList.add("hidden");
    if (modalOkAction) {
        modalOkAction();   // 覚えておいたことを実行する
    }
    modalOkAction = null;
});

// やめるを押したとき：何もしないで閉じる
document.getElementById("modal-cancel").addEventListener("click", function () {   // ③
    document.getElementById("modal").classList.add("hidden");
    modalOkAction = null;
});