import { Permissions, GuildMember } from 'discord.js'

/**
 *
 * @param {GuildMember} member
 * @param {String[] | String} permissions
 */
export function checkUserPermissions(member, permissionsArray) {
  return member.permissions.has(permissionsArray)
}

/**
 *
 * @param {GuildMember} member
 */
export function checkForAdminPermissions(member) {
  return member.permissions.has('ADMINISTRATOR')
}

/**
 *
 * @param {GuildMember} member
 * @param {String[]} roleNames
 * @returns {Boolean}
 */
export function checkUserRole(member, roleName) {
  return member.roles.some((role) => role.name === roleName)
}
