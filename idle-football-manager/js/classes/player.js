class Player {
    constructor(name, attack, defense, aggressivity, stamina, active, marketValue = new Decimal(0)) {
        this.name = name;
        this.attack = attack;
        this.defense = defense;
        this.active = active;
        this.marketValue = marketValue;
        this.sellMultiplier = 0.6;
        this.stamina = stamina;
        this.aggressivity = aggressivity;
        this.currentStamina = 1;
        this.redCard = false;
    }

    //used for display on player component
    getBaseAttack() {
        return this.attack;
    }

    //used for display on player component
    getBaseDefense() {
        return this.defense;
    }

    getAttack() {
        return this.attack.mul(0.5 + 0.5 * this.currentStamina);
    }

    getDefense(){
        return this.defense.mul(0.5 + 0.5 * this.currentStamina);
    }

    getRegenerationTime(){
        return 1000 / (this.stamina * game.moneyUpgrades.playerRegeneration.apply().toNumber());
    }

    regenerate(dt){
        this.currentStamina = Math.min(1, this.currentStamina + dt * 1 / this.getRegenerationTime());
    }

    isBought(){
        return game.team.players.find(p => p === this) !== undefined;
    }

    getPrice(){
        return this.marketValue.mul(game.moneyUpgrades.cheaperPlayers.apply());
    }

    canAfford(){
        return game.money.gte(this.getPrice());
    }

    buy(){
        if(!this.isBought() && this.canAfford()){
            game.money = game.money.sub(this.marketValue);
            game.team.players.push(this);
            game.playerMarket.players = game.playerMarket.players.filter(p => p !== this);
        }
    }

    getSellAmount(){
        return this.getPrice().mul(this.sellMultiplier);
    }

    sell(){
        if(!this.active && this.isBought()){
            game.money = game.money.add(this.getSellAmount());
            game.playerMarket.players.push(this);
            game.team.players = game.team.players.filter(p => p !== this);
        }
    }

    load(obj){
        this.name = obj.name;
        this.attack = obj.attack;
        this.defense = obj.defense;
        this.stamina = obj.stamina;
        this.aggressivity = obj.aggressivity;
        this.currentStamina = obj.currentStamina;
        this.marketValue = obj.marketValue;
        this.sellMultiplier = obj.sellMultiplier;
        this.redCard = obj.redCard;
    }
}