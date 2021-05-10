var game = {
    version: "1.0",
    timeSaved: Date.now(),
    layers: [],
    highestLayer: 0,
    automators: {
        autoMaxAll: new Automator("Auto Max All", "Automatically buys max on all Layers", () =>
        {
            for(let i = Math.max(0, game.volatility.autoMaxAll.apply().toNumber()); i < game.layers.length; i++)
            {
                game.layers[i].maxAll();
            }
        }, new DynamicLayerUpgrade(level => Math.floor(level / 3) + 1, () => null, () => "Decrease the Automator interval",
            level => Decimal.pow(10, PrestigeLayer.getPrestigeCarryOverForLayer(level.toNumber()) * [0.2, 0.5, 0.8][level.toNumber() % 3]),
            level => level.gt(0) ? Math.pow(0.8, level.toNumber() - 1) * 10 : Infinity, null, {
                getEffectDisplay: effectDisplayTemplates.automator()
            })),
        autoPrestige: new Automator("Auto Prestige", "Automatically prestiges all Layers", () =>
        {
            for(let i = 0; i < game.layers.length - 1; i++)
            {
                if(game.layers[game.layers.length - 2].canPrestige() && !game.settings.autoPrestigeHighestLayer)
                {
                    break;
                }
                if(game.layers[i].canPrestige() && !game.layers[i].isNonVolatile())
                {
                    game.layers[i].prestige();
                }
            }
        }, new DynamicLayerUpgrade(level => Math.floor(level / 2) + 2, () => null, () => "Decrease the Automator interval",
            level => Decimal.pow(10, PrestigeLayer.getPrestigeCarryOverForLayer(level.add(2).toNumber()) * (level.toNumber() % 2 === 0 ? 0.25 : 0.75)),
            level => level.gt(0) ? Math.pow(0.6, level.toNumber() - 1) * 30 : Infinity, null, {
                getEffectDisplay: effectDisplayTemplates.automator()
            })),
        autoAleph: new Automator("Auto Aleph", "Automatically Max All Aleph Upgrades", () =>
        {
            game.alephLayer.maxAll();
        }, new DynamicLayerUpgrade(level => level + 3, () => null, () => "Decrease the Automator interval",
            level => Decimal.pow(10, PrestigeLayer.getPrestigeCarryOverForLayer(level.add(3).toNumber()) * 0.7),
            level => level.gt(0) ? Math.pow(0.6, level.toNumber() - 1) * 60 : Infinity, null, {
                getEffectDisplay: effectDisplayTemplates.automator()
            })),
    },
    volatility: {
        layerVolatility: new DynamicLayerUpgrade(level => level + 1, level => level,
            function()
            {
                return "Make the next Layer non-volatile";
            }, level => Decimal.pow(10, PrestigeLayer.getPrestigeCarryOverForLayer(level.add(1).toNumber())), level => level.sub(1), null, {
                getEffectDisplay: function()
                {
                    let val1 = this.level.eq(0) ? "None" : PrestigeLayer.getNameForLayer(this.apply().toNumber());
                    let val2 = PrestigeLayer.getNameForLayer(this.getEffect(this.level.add(1)).toNumber());
                    return val1 + " → " + val2;
                }
            }),
        prestigePerSecond: new DynamicLayerUpgrade(level => Math.round(level * 1.3) + 3, level => null,
            () => "Boost the Prestige Reward you get per second",
            function(level)
            {
                let max = PrestigeLayer.getPrestigeCarryOverForLayer(Math.round(level.toNumber() * 1.3) + 3);
                return Decimal.pow(10, new Random(level.toNumber() * 10 + 10).nextDouble() * max).round();
            }, level => new Decimal(0.5 + 0.1 * level), null, {
                getEffectDisplay: effectDisplayTemplates.percentStandard(0)
            }),
        autoMaxAll: new DynamicLayerUpgrade(level => level + 2, level => level,
            function()
            {
                return "The next Layer is maxed automatically each tick";
            }, level => Decimal.pow(10, PrestigeLayer.getPrestigeCarryOverForLayer(level.add(2).toNumber()) * 0.125), level => level.sub(1), null, {
                getEffectDisplay: function()
                {
                    let val1 = this.level.eq(0) ? "None" : PrestigeLayer.getNameForLayer(this.apply().toNumber());
                    let val2 = PrestigeLayer.getNameForLayer(this.getEffect(this.level.add(1)).toNumber());
                    return val1 + " → " + val2;
                }
            }),
    },
    alephLayer: new AlephLayer(),
    restackLayer: new ReStackLayer(),
    metaLayer: new MetaLayer(),
    achievements: [
        new Achievement("You've awoken... into what, though?", "Obtain your first α", "α 1", () => game.layers[0] && game.layers[0].resource.gt(1)),
        new Achievement("Just starting out, eh?", "Reach 1,000 α", "α 2", () => game.layers[0] && game.layers[0].resource.gt(1000)),
        new Achievement("Millionaire", "Reach 1,000,000 α", "α 3", () => game.layers[0] && game.layers[0].resource.gt("1e6")),
        new Achievement("Trillionaire", "Reach 1,000,000,000,000 α", "α 4", () => game.layers[0] && game.layers[0].resource.gt("1e12")),
        new Achievement("Wait, what?", "Reach 1e20 α", "α 5", () => game.layers[0] && game.layers[0].resource.gt("1e20")),
        new Achievement("You ready for Beta?", "Reach 1e24 α", "α 6", () => game.layers[0] && game.layers[0].resource.gt("1e24")),
        new Achievement("The Decillion", "Reach 1e33 α", "α 7", () => game.layers[0] && game.layers[0].resource.gt("1e33")),
        new Achievement("Google", "Reach 1e100 α", "α 8", () => game.layers[0] && game.layers[0].resource.gt("1e100")),
        new Achievement("Vanilla JavaScript can't handle these numbers anymore...", "Reach ~1.8e308 α", "α 9", () => game.layers[0] && game.layers[0].resource.gt(INFINITY)),
        new Achievement("What a Millillionaire!", "Reach 1e3,003 α", "α 10", () => game.layers[0] && game.layers[0].resource.gt("1e3003")),
        new Achievement("Micrillions, anyone?", "Reach 1e3,000,003 α", "α 11", () => game.layers[0] && game.layers[0].resource.gt("1e3000003")),
        new Achievement("One with the Nanillion", "Reach 1e3,000,000,003 α", "α 12", () => game.layers[0] && game.layers[0].resource.gt("1e3000000003")),
        new Achievement("One with the Picillion", "Reach 1e3,000,000,000,003 α", "α 13", () => game.layers[0] && game.layers[0].resource.gt("1e3000000000003")),
        new Achievement("How?!", "Reach 1e10,000,000,000,000,000 α", "α 14", () => game.layers[0] && game.layers[0].resource.gt("1ee16")),
        new Achievement("2 tetrated to 3", "Reach 1ee19.35 α", "α 15", () => game.layers[0] && game.layers[0].resource.gt("1ee19.35")),
        new Achievement("Bruh...", "Reach 1ee50 α", "α 16", () => game.layers[0] && game.layers[0].resource.gt("1ee50")),
        new Achievement("Gοnε βετα", "Go β for the first time", "β", () => game.layers[1] && game.layers[1].timesReset > 0),
        new Achievement("Beta-10", "Go β 10 times", "β-10", () => game.layers[1] && game.layers[1].timesReset >= 10),
        new Achievement("Beta Millionaire", "Reach 1,000,000 β", "β 1", () => game.layers[1] && game.layers[1].resource.gte(1e6)),
        new Achievement("There's another layer to it?", "Reach 1e20 β", "β 2", () => game.layers[1] && game.layers[1].resource.gte(1e20)),
        new Achievement("Gοnε Gαmmα", "Go γ", "γ", () => game.layers[2] && game.layers[2].timesReset > 0),
        new Achievement("Gamma Millionaire", "Reach 1,000,000 γ", "γ 1", () => game.layers[2] && game.layers[2].resource.gte(1e6)),
        new Achievement("How many layers are there?!", "Reach 1e20 γ", "γ 2", () => game.layers[2] && game.layers[2].resource.gte(1e20)),
        new Achievement("Gοnε Dεlτα", "Go δ", "δ", () => game.layers[3] && game.layers[3].timesReset > 0),
        new Achievement("Aleph-Null", "Reach 1,000 ℵ", '<span class="aleph">ℵ</span><sub>0</sub>', () => game.alephLayer.aleph.gte(1000)),
        new Achievement("Aleph-1", "Reach 10,000,000,000 ℵ", '<span class="aleph">ℵ</span><sub>1</sub>', () => game.alephLayer.aleph.gte(1e10)),
        new Achievement("Aleph-2", "Reach 1e30 ℵ", '<span class="aleph">ℵ</span><sub>2</sub>', () => game.alephLayer.aleph.gte(1e30)),
        new Achievement("Aleph-3", "Reach 1e100 ℵ", '<span class="aleph">ℵ</span><sub>3</sub>', () => game.alephLayer.aleph.gte(1e100)),
        new Achievement("Aleph-4", "Reach 1.8e308 ℵ", '<span class="aleph">ℵ</span><sub>4</sub>', () => game.alephLayer.aleph.gte(INFINITY)),
        new Achievement("Gοnε Ερsιlοn", "Go ε", "ε", () => game.layers[4] && game.layers[4].timesReset > 0),
        new Achievement("Gοnε Ζετα", "Go ζ", "ζ", () => game.layers[5] && game.layers[5].timesReset > 0),
        new Achievement("Gοnε Ετα", "Go η", "η", () => game.layers[6] && game.layers[6].timesReset > 0),
        new Achievement("Gοnε Τhετα", "Go θ", "θ", () => game.layers[7] && game.layers[7].timesReset > 0),
        new Achievement("Gοnε Ιοτα", "Go ι", "ι", () => game.layers[8] && game.layers[8].timesReset > 0),
        new Achievement("Gοnε Καρρα", "Go κ", "κ", () => game.layers[9] && game.layers[9].timesReset > 0),
        new Achievement("Gοnε Lαmbdα", "Go λ", "λ", () => game.layers[10] && game.layers[10].timesReset > 0),
        new Achievement("Gοnε Μμ", "Go μ", "μ", () => game.layers[11] && game.layers[11].timesReset > 0),
        new Achievement("Gοnε Νμ", "Go ν", "ν", () => game.layers[12] && game.layers[12].timesReset > 0),
        new Achievement("Gοnε Χι", "Go ξ", "ξ", () => game.layers[13] && game.layers[13].timesReset > 0),
        new Achievement("Gοnε Οmιcrοn", "Go ο", "ο", () => game.layers[14] && game.layers[14].timesReset > 0),
        new Achievement("Gοnε Ρι", "Go π", "π", () => game.layers[15] && game.layers[15].timesReset > 0),
        new Achievement("Gοnε Rhο", "Go ρ", "ρ", () => game.layers[16] && game.layers[16].timesReset > 0),
        new Achievement("Gοnε Sιgmα", "Go σ", "σ", () => game.layers[17] && game.layers[17].timesReset > 0),
        new Achievement("Gοnε Ταυ", "Go τ", "τ", () => game.layers[18] && game.layers[18].timesReset > 0),
        new Achievement("Gοnε Uρsιlοn", "Go υ", "υ", () => game.layers[19] && game.layers[19].timesReset > 0),
        new Achievement("Gοnε Ρhι", "Go φ", "φ", () => game.layers[20] && game.layers[20].timesReset > 0),
        new Achievement("Gοnε Chι", "Go χ", "χ", () => game.layers[21] && game.layers[21].timesReset > 0),
        new Achievement("Gοnε Ρsι", "Go ψ", "ψ", () => game.layers[22] && game.layers[22].timesReset > 0),
        new Achievement("Gοnε Οmεgα", "Go ω", "ω", () => game.layers[23] && game.layers[23].timesReset > 0),
        new Achievement("Back to Alpha again? Wait, this is different...", "Go Α", "Α", () => game.layers[24] && game.layers[24].timesReset > 0),
        new Achievement("Persistence is Key", "Make layer α non-volatile", '<img src="images/save.svg" alt="S">', () => game.volatility.layerVolatility.level.gt(0)),
        new Achievement("Persistence is Key II", "Make layer γ non-volatile", '<img src="images/save.svg" alt="S">', () => game.volatility.layerVolatility.level.gt(2)),
        new Achievement("Persistence is Key III", "Make layer ζ non-volatile", '<img src="images/save.svg" alt="S">', () => game.volatility.layerVolatility.level.gt(5)),
        new Achievement("Persistence is Key IV", "Make layer κ non-volatile", '<img src="images/save.svg" alt="S">', () => game.volatility.layerVolatility.level.gt(9)),
        new Achievement("Persistence is Key V", "Make layer ο non-volatile", '<img src="images/save.svg" alt="S">', () => game.volatility.layerVolatility.level.gt(14)),
        new Achievement("Born Anew", "ReStack for the first time!", "<img alt=\"LC\" class=\"inline\" src=\"images/layercoin.svg\"/>", () => game.restackLayer.timesReset > 0),
        new Achievement("Was all this a dream?!", "Purchase the Meta Upgrade", "<img alt=\"LC\" class=\"inline\" src=\"images/layercoin.svg\"/>", () => game.restackLayer.metaUpgrade.level.gt(0)),
        new Achievement("THIS WAS ALL A DREAM, WASN'T IT?!", "Go Meta!", "<img alt=\"LC\" class=\"inline\" src=\"images/layercoin.svg\"/>", () => game.metaLayer.active),
        new Achievement("Cool, a new layer every other second!", "Advance 1 layer per 2 seconds", "»1", () => game.metaLayer.getLayersPS().gte(0.5)),
        new Achievement("Now we're talkin'!", "Advance 1 layer per second", "»2", () => game.metaLayer.getLayersPS().gte(1)),
        new Achievement("Going fast!", "Advance 10 layers per second", "»3", () => game.metaLayer.getLayersPS().gte(10)),
        new Achievement("Okay, this is getting crazy...", "Advance 1,000 layers per second", "»4", () => game.metaLayer.getLayersPS().gte(1000)),
        new Achievement("What the—?", "Advance 1,000,000,000 layers per second", "»5", () => game.metaLayer.getLayersPS().gte(1000000000)),
        new Achievement("Now this is waaay too fast...", "Advance 1e30 layers per second", "»6", () => game.metaLayer.getLayersPS().gte(1e30)),
        new Achievement("Meta is real helpful!", "Reach Layer Ω", "Ω", () => game.metaLayer.layer.gte(47)),
        new Achievement("I never could have made it this far without Meta...", "Reach Layer 1,000", "Ρ↑β", () => game.metaLayer.layer.gte(1000)),
        new Achievement("These heights are insane...", "Reach Layer 1e10", "10<sup>10</sup>", () => game.metaLayer.layer.gte(1e10)),
        new Achievement("How is this happening?", "Reach Layer 1e100", "10<sup>100</sup>", () => game.metaLayer.layer.gte(1e100)),
        new Achievement("IMPOSSIBLE!", "Reach Layer ~1.8e308", "<span class='flipped-v'>Ω</span>", () => game.metaLayer.layer.gte(INFINITY)),
        new Achievement("AutoMaxing, how awesome is that?!", "Enable the \"Max All\" Automator", "<img src=\"images/hardware-chip.svg\" alt=\"A\">", () => game.automators.autoMaxAll.upgrade.level.gte(1)),
        new Achievement("AutoMax 10", "Upgrade the \"Max All\" Automator to Level 10", "<img src=\"images/hardware-chip.svg\" alt=\"A\">", () => game.automators.autoMaxAll.upgrade.level.gte(10)),
        new Achievement("Now you don't have to worry about checking the Aleph layer all the time... or do you?", "Enable the Aleph Automator", "<img src=\"images/hardware-chip.svg\" alt=\"A\">", () => game.automators.autoAleph.upgrade.level.gte(1)),
        new Achievement("Less than 10 seconds later...", "Upgrade the Aleph Automator to Level 5", "<img src=\"images/hardware-chip.svg\" alt=\"A\">", () => game.automators.autoAleph.upgrade.level.gte(5)),
        new Achievement("Every second!", "Upgrade the Aleph Automator to Level 10", "<img src=\"images/hardware-chip.svg\" alt=\"A\">", () => game.automators.autoAleph.upgrade.level.gte(10))
    ],
    currentLayer: null,
    currentChallenge: null,
    notifications: [],
    timeSpent: 0,
    settings: {
        tab: "Layers",
        showAllLayers: true,
        showMinLayers: 5,
        showMaxLayers: 5,
        showLayerOrdinals: false,
        layerTickSpeed: 1,
        buyMaxAlways10: true,
        disableBuyMaxOnHighestLayer: false,
        resourceColors: true,
        resourceGlow: true,
        newsTicker: true,
        autoMaxAll: true,
        autoPrestigeHighestLayer: true,
        notifications: true,
        saveNotifications: true,
        confirmations: true,
        offlineProgress: true,
        titleStyle: 2,
        theme: "dark.css"
    }
};

let initialGame = functions.getSaveString();
