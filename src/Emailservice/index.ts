import mssql from 'mssql'
import ejs from 'ejs'
import { sqlConfig } from '../config'
import path from 'path'
import dotenv from 'dotenv'
import { sendEmail } from '../helpers'
dotenv.config({path:path.resolve(__dirname,"../../.env")})

 interface User{
  Id:string,
  email:string
  username:string
  password:string
  isDeleted:number
  isEmailSent:number
}

export async function run(){
    try {
      let pool = await mssql.connect(sqlConfig)
      let users= (await pool.request().query("SELECT * FROM users WHERE isEmailSent = 0")).recordset as User[]
      users.forEach(user=>{

        ejs.renderFile("template/register.ejs", {name:user.username}, async(error,data)=>{

          let messageOptions={
            to:user.email,
            from:process.env.EMAIL,
            subject:"Welcome Aboard",
            html:data
          }
          await sendEmail(messageOptions)

          await pool.request().query(`UPDATE users SET isEmailSent=1 WHERE Id ='${user.Id}' `)
        })
      })
    } catch (error) {
    }
}