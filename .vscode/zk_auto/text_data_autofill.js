/**
 * @param {JsonValue} dict
 */
async function fillOutfitCombos(dict) {
    console.log("正在自动填充服装组合");
    const outfitCombos = (await zk.mdb.loadTextData())["4"];

    let tlOutfitCombos = dict.get("4");
    if (!tlOutfitCombos) {
        dict.set("4", {});
        tlOutfitCombos = dict.get("4");
    }
    const tlOutfits = dict.get("5");
    const tlCharas = dict.get("6");
    if (!tlOutfits || !tlCharas) {
        console.warn("文本数据类别 5 或 6 不存在");
        return;
    }

    let count = 0;
    for (const id in outfitCombos) {
        // 服装组合是安全的，处理所有条目以反映更新。
        // if (tlOutfitCombos.get(id)) continue;

        const outfitId = id.slice(-6);
        const charaId = id.slice(-6, -2);

        const outfit = tlOutfits.get(outfitId);
        const chara = tlCharas.get(charaId);

        if (!outfit) {
            console.warn(`未找到服装 ${outfitId}`);
            continue;
        }

        if (!chara) {
            console.warn(`未找到角色 ${charaId}`);
            continue;
        }

        tlOutfitCombos.set(id, `${chara.value}的${outfit.value}`);
        ++count;
    }
    return count;
}

/**
 * @param {JsonValue} dict
 */
async function fillSupportCombos(dict) {
    console.log("正在自动填充支援卡组合");
    const supportCombos = (await zk.mdb.loadTextData())["75"];

    let tlSupportCombos = dict.get("75");
    if (!tlSupportCombos) {
        dict.set("75", {});
        tlSupportCombos = dict.get("75");
    }
    const tlSupports = dict.get("76");
    const tlCharas = dict.get("77");
    const tlSupportsUnique = dict.get("150");
    if (!tlSupports || !tlCharas || !tlSupportsUnique) {
        console.warn("文本数据类别 76、77 或 150 不存在");
        return;
    }

    let count = 0;
    for (const id in supportCombos) {
        // 支援组合是安全的，处理所有条目以反映更新。
        // if (tlSupportCombos.get(id)) continue;

        const chara = tlCharas.get(id);
        const unique = tlSupportsUnique.get(id);

        if (!chara) {
            console.warn(`未找到角色 ${id}`);
            continue;
        }
        if (!unique) {
            console.warn(`未找到 Unique 条目 ${id}`);
            continue;
        }

        tlSupports.set(id, `【${unique.value}】`);
        tlSupportCombos.set(id, `${chara.value}的${unique.value}`);
        ++count;
    }
    return count;
}

/**
 * @param {JsonValue} dict
 */
async function fillPieces(dict) {
    console.log("正在自动填充碎片");
    const pieces = (await zk.mdb.loadTextData())["113"];

    let tlPieces = dict.get("113");
    if (!tlPieces) {
        dict.set("113", {});
        tlPieces = dict.get("113");
    }
    const tlCharas = dict.get("6");
    if (!tlCharas) {
        console.warn("文本数据类别 6 不存在");
        return;
    }

    let count = 0;
    for (const id in pieces) {
        // 安全处理所有条目
        // if (tlPieces.get(id)) continue;

        const charaId = id.slice(0, 4);
        const chara = tlCharas.get(charaId);

        if (!chara) {
            if (charaId != "1000")
                console.warn(`未找到角色 ${charaId}`);

            continue;
        }

        tlPieces.set(id, `${chara.value}的碎片`);
        ++count;
    }
    return count;
}

async function run() {
    await zk.updateDict("text_data_dict.json", async dict => {
        const outfitComboCount = await fillOutfitCombos(dict);
        const supportComboCount = await fillSupportCombos(dict);
        const pieceCount = await fillPieces(dict);

        if (outfitComboCount || supportComboCount || pieceCount || birthdayCount) {
            zk.showInfo(`文本数据自动填充： \
                ${outfitComboCount} 个服装组合， \
                ${supportComboCount} 个支援卡组合， \
                ${pieceCount} 个碎片
            `);
        }
        else {
            zk.showInfo("文本数据自动填充：无可填充项");
            return false;
        }
    });
}

run();