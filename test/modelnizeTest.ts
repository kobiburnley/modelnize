import {expect} from "chai"
import * as Sequelize from "sequelize"
import {DefineAttributes} from "sequelize"
import "../src"
import {User} from "./user"
import {UserSchema, userSchema} from "./userSchema"

const sql = new Sequelize({
  dialect: "mysql",
  database: "circle_test",
  username: "root",
  password: ""
})

const users = sql.defineModel<User, UserSchema>({
  modelName: "user",
  newInstance: User.parse,
  attributes: userSchema
})

describe("modelnizeTest", function() {
  before(async () => {
    await sql.sync()
  })

  after(async () => {
    await users.drop()
    await sql.close()
  })

  it("should modelnize", async () => {
    const user = await users.createOne(User.empty.copy({name: "Kool Ye"}))
    expect(user).to.be.instanceOf(User)

    const items = await users.fetchAll({
      where: {
        name: {
          [Sequelize.Op.like]: "%oo%"
        }
      }
    })

    expect(items.length > 0).to.eq(true)
    expect(items.every(e => e instanceof User)).to.eq(true)
  })

  it("should createMany", async () => {
    console.log(await users.createMany([{name: "1"}, {name: "2"}]))
  })

  it("should createOne", async () => {
    console.log(await users.createOne({name: "1"}))
  })

  it("should updateOne", async () => {
    const user = await users.createOne({name: "1"})
    console.log(
      await users.updateOne(
        {name: "10"},
        {
          where: {
            id: user.id
          }
        }
      )
    )
  })

  it("should customFetchAll", async () => {
    console.log(
      await users.customFetchAll({
        where: {
          name: {
            [Sequelize.Op.like]: "%oo%"
          }
        }
      })
    )
  })

  it("should customFetchOne", async () => {
    console.log(
      await users.customFetchOne({
        where: {
          name: {
            [Sequelize.Op.like]: "%oo%"
          }
        }
      })
    )
  })

  it("should customFetchAndCountAll", async () => {
    await users.customFetchAndCountAll({
      where: {
        name: {
          [Sequelize.Op.like]: "%oo%"
        }
      }
    })
  })

  it("should createOneCustom", async () => {
    const {name} = await users.createOneCustom<{name: string}>({name: "a3473"})
    expect(name).to.eq("a3473")
  })

  it("should createManyCustom", async () => {
    const created = await users.createManyCustom<{name: string}>([{name: "abc"}, {name: "axy"}])

    expect(created.length).to.eq(2)
    expect(created.some(e => e.name === "axy")).to.eq(true)
  })
})
