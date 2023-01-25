import CharacterImport from '../../character/import.js'

// reference to the D&D Beyond popup
const POPUPS = {
  json: null,
  web: null,
}
const renderPopup = (type, url) => {
  if (POPUPS[type] && !POPUPS[type].close) {
    POPUPS[type].focus()
    POPUPS[type].location.href = url
  } else {
    const ratio = window.innerWidth / window.innerHeight
    const width = Math.round(window.innerWidth * 0.5)
    const height = Math.round(window.innerWidth * 0.5 * ratio)
    POPUPS[type] = window.open(
      url,
      'ddb_sheet_popup',
      `resizeable,scrollbars,location=no,width=${width},height=${height},toolbar=1`,
    )
  }
  return true
}

export default function () {
  /**
   * Character sheets
   */
  let pcSheetNames = Object.values(CONFIG.Actor.sheetClasses.character)
    .map((sheetClass) => sheetClass.cls)
    .map((sheet) => sheet.name)

  pcSheetNames.forEach((sheetName) => {
    Hooks.on('render' + sheetName, (app, html, data) => {
      // only for GMs or the owner of this character
      if (!data.owner || !data.actor) return

      // don't add the button multiple times
      if ($(html).find('#ddbImportButton').length > 0) return

      let button = $('<button type="button" id="ddbImportButton" class="inactive"></button>')
      if (
        app.entity.data.flags.vtta &&
        app.entity.data.flags.vtta.dndbeyond &&
        app.entity.data.flags.vtta.dndbeyond.url
      ) {
        button.removeClass('inactive')
      }

      let characterImport

      button.click((event) => {
        let url = null
        if (
          app.entity.data.flags.vtta &&
          app.entity.data.flags.vtta.dndbeyond &&
          app.entity.data.flags.vtta.dndbeyond.url
        ) {
          url = app.entity.data.flags.vtta.dndbeyond.url
        }

        let jsonURL = null
        if (
          app.entity.data.flags.vtta &&
          app.entity.data.flags.vtta.dndbeyond &&
          app.entity.data.flags.vtta.dndbeyond.json
        ) {
          jsonURL = app.entity.data.flags.vtta.dndbeyond.json
        }

        if (event.shiftKey) {
          event.preventDefault()
          return renderPopup('web', url)
        }

        if (event.altKey && jsonURL) {
          event.preventDefault()
          return renderPopup('json', jsonURL)
        }
        if (event.altKey && !jsonURL) {
          // get the character ID
          const characterId = url.split('/').pop()
          if (characterId) {
            event.preventDefault()
            return renderPopup('json', 'https://character-service.dndbeyond.com/character/v4/character/' + characterId)
          }
        }

        if ((!event.shiftKey && !event.ctrlKey && !event.altKey) || url === null) {
          characterImport = new CharacterImport(CharacterImport.defaultOptions, data.actor)
          characterImport.render(true)
          return true
        }

        return false
      })

      let wrap = $('<div class="ddbCharacterName"></div>')
      $(html).find("input[name='name']").wrap(wrap)
      $(html).find("input[name='name']").parent().prepend(button)
    })
  })

  /**
   * NPC sheets
   */
  let npcSheetNames = Object.values(CONFIG.Actor.sheetClasses.npc)
    .map((sheetClass) => sheetClass.cls)
    .map((sheet) => sheet.name)

  npcSheetNames.forEach((sheetName) => {
    Hooks.on('render' + sheetName, (app, html, data) => {
      // only for GMs or the owner of this npc
      if (!data.owner || !data.actor) return

      // don't add the button multiple times
      if ($(html).find('#ddbImportButton').length > 0) return

      let button = $('<button type="button" id="ddbImportButton"></button>')

      if (
        app.entity.data.flags.vtta &&
        app.entity.data.flags.vtta.dndbeyond &&
        app.entity.data.flags.vtta.dndbeyond.url
      ) {
        button.click((event) => {
          let url = null

          url = app.entity.data.flags.vtta.dndbeyond.url

          event.preventDefault()
          renderPopup('web', url)
        })
      }

      let wrap = $('<div class="ddbCharacterName"></div>')
      $(html).find("input[name='name']").wrap(wrap)
      $(html).find("input[name='name']").parent().prepend(button)
    })
  })
}
