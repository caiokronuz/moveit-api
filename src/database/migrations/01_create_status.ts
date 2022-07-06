import {Knex} from 'Knex'

export async function up(knex: Knex){
    return knex.schema.createTable('status', table => {
        table.increments('id_status')
            .primary()
            .references('id')
            .inTable('users')
            .onUpdate('CASCADE')
            .onDelete('CASCADE')


        table.integer('level').notNullable();
        table.integer('experience').notNullable();
        table.integer('challenges_completed').notNullable();
    })
}

export async function down(knex: Knex){
    return knex.schema.dropTable('status')
}