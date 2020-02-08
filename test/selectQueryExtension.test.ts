import * as Sequelize from "sequelize"
import {DefineAttributes} from "sequelize"
import "../src/model"
import "../src/selectQueryExtension"
import "../src/sequelize"
import {User} from "./user"
import {UserSchema, userSchema} from "./userSchema"

const sql = new Sequelize({
  dialect: "mysql",
  database: "circle_test",
  username: "root",
  password: ""
})

const users = sql.defineModel<User, DefineAttributes, UserSchema>({
  modelName: "user",
  newInstance: User.parse,
  attributes: userSchema
})

describe("selectQueryExtension", function() {
  before(async () => {
    await sql.sync({alter: true})
  })

  after(async () => {
    await sql.close()
  })

  it("should selectQuerySQL", async () => {
    const {Op} = users.sequelize
    const havingActive = users.sequelize.literal(
      `BIT_OR(CASE WHEN "${users.rawAttributes.active.field}" is null THEN true else false END) = false`
    )

    const rawSQL = users.selectQuerySQL({
      tableAs: "active_users",
      attributes: [users.rawAttributes.id.field],
      group: [users.rawAttributes.id.field],
      having: {
        active: havingActive
      },
      where: {
        [users.rawAttributes.createdAt.field]: {
          [Op.gte]: new Date("2020-01-01"),
          [Op.lte]: new Date("2020-02-01")
        }
      }
    })

    await users.findAll({
      where: {
        id: {
          [Op.in]: users.sequelize.literal(`(${rawSQL})`)
        }
      }
    })

    await users.sequelize.query(rawSQL)
  })
})