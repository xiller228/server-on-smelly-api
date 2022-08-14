import {
  ItemStack,
  Items,
  MinecraftEnchantmentTypes,
  Enchantment,
  InventoryComponentContainer,
  world,
  ItemType,
} from "mojang-minecraft";
import { po, wo } from "../../../../../app/Models/Options.js";
import { SA } from "../../../../../index.js";
import { ChestGUI } from "./ChestGUI.js";
import { auxa, lich } from "../../static_pages.js";
import { PAGES } from "./Page.js";
import { ModalFormData, ModalFormResponse } from "mojang-minecraft-ui";
//import { ActionFormData, MessageFormData, ModalFormData, ModalFormResponse } from "mojang-minecraft-ui";

export class Action {
  /**
   * Runs a item action when its grabbed out of a container
   * @param {ChestGUI} chestGUI chest gui used
   * @param {import("./Page.js").Item} item item that was grabbed
   */
  static run(chestGUI, Item) {}
}

export class GiveAction extends Action {
  /**
   * Gives the player the item the grabbed
   * @param {ChestGUI} chestGUI chest gui used
   * @param {import("./Page.js").Item} Item item that was grabbed
   */
  static run(chestGUI, Item) {
    let itemStack = new ItemStack(Items.get(Item.type), Item.amount, Item.data);
    if (Item?.components?.enchantments?.length > 0) {
      const MinecraftEnchantments = Object.values(MinecraftEnchantmentTypes);
      const ItemStackEnchantments =
        itemStack.getComponent("enchantments").enchantments;
      for (const ench of Item.components.enchantments) {
        ItemStackEnchantments.addEnchantment(
          new Enchantment(
            MinecraftEnchantments.find((type) => type.id == ench.id),
            ench.level
          )
        );
      }
      itemStack.getComponent("enchantments").enchantments =
        ItemStackEnchantments;
    }
    itemStack.nameTag = Item.name;
    chestGUI.player
      .getComponent("minecraft:inventory")
      .container.addItem(itemStack);
  }
}


export class PageAction extends Action {
  /**
   * Changes the page of the chestGui when this item is grabbed
   * @param {ChestGUI} chestGUI chest gui used
   * @param {import("./Page.js").Item} Item item that was grabbed
   */
  static run(chestGUI, Item) {
    const pageTo = Item.action.replace("page:", "");
    chestGUI.setPage(pageTo);
  }
}

export class CloseAction extends Action {
  /**
   * Closes the chect GUI when this item is grabbed
   * @param {ChestGUI} chestGUI chest gui used
   */
  static run(chestGUI) {
    chestGUI.kill();
  }
}

export class CommandAction extends Action {
  /**
   * Runs a command on the player when this item is grabbed
   * @param {ChestGUI} chestGUI chest gui used
   * @param {import("./Page.js").Item} Item item that was grabbed
   */
  static run(chestGUI, Item) {
    const command = Item.action.split("command:")?.[1];
    try {
      chestGUI.player.runCommand(command);
    } catch (error) {}
  }
}

export class ChangeAction extends Action {
  /**
   * Runs a command on the player when this item is grabbed
   * @param {ChestGUI} chestGUI chest gui used
   * @param {import("./Page.js").Item} Item item that was grabbed
   */
  static run(chestGUI, Item, slot) {
    const ret = wo.change(SA.Utilities.format.clearColors(Item.name))

    let id = ''
    if (ret[0] == "added") id = Item.action.split(':')[1]
    if (ret[0] == "removed") id = Item.action.split(':')[2]

    auxa.createItem(slot, id, Item.amount, Item.data, Item.action, Item.name, Item.lore)
    chestGUI.setPage('worldsett')
  }
}

export class ChangePAction extends Action {
  static run(chestGUI, Item, slot, player) {
    const ret = po.change(SA.Utilities.format.clearColors(Item.name), player)
    let id = ret[1]?.Aitem ?? ''
    let vid = ret[1]?.exp ?? false
    let ench = {}
    if (!ret[1].Aitem) {
      if (ret[0] == "added" && !vid) id = "minecraft:lime_candle"
      if (ret[0] == "added" && vid) id = "minecraft:yellow_candle"
      if (ret[0] == "removed") id = "minecraft:red_candle"
    } else { 
    if (ret[0] == "added") {
      ench.id = "mending"
      ench.lvl = 1
    }
    if (ret[0] == "removed") {
      ench.id = ''
      ench.lvl = 0
    }
    }
    let ppage = ''
    const iid = 'forplayer:'+player.name
    PAGES[iid] ? ppage = PAGES[iid] : ppage = lich
    ppage.createItem(slot, id, Item.amount, Item.data, Item.action, Item.name, Item.lore, [ench])
    chestGUI.setPage(ppage.id)
  }
}

export class OpenForm extends Action {
  /**
   * 
   * @param {*} chestGUI 
   * @param {*} player 
   * @param {ModalFormData} form 
   * @param {Function<ModalFormResponse>} callback 
   */
  static run(chestGUI, player, form, callback) {
    chestGUI.kill()
    SA.Utilities.time.setTickTimeout(() => {
      form
      .show(player).then((res) => {
        return callback ? callback(res) : null
      })
      // const c = new ModalFormData()
      // c.show().then(ModalFormResponse => {
      //   ModalFormResponse.isCanceled
      //   ModalFormResponse.formValues
      // })
    }, 5)
  }
}



export class SetAction extends Action {
  /**
   * Sets the item back
   * @param {ChestGUI} chestGUI chest gui used
   * @param {import("./Page.js").Item} Item item that was grabbed
   * @param {Number} slot slot that was changed
   * @param {ItemStack} itemStack itemStack that was changed
   */
  static run(chestGUI, Item, slot, itemStack) {
    /**
     * @type {InventoryComponentContainer}
     */
    const it = itemStack
    if (Item.lore) it.setLore(Item.lore)
    if (Item.name) it.nameTag = Item.name
    const container = chestGUI.entity.getComponent(
      "minecraft:inventory"
    ).container;
    container.setItem(slot, it);
  }
}
