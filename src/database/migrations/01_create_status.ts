import {Knex} from 'knex'

export async function up(knex: Knex){
    return knex.schema.createTable('status', table => {
        table.increments('id').primary();

        table.integer('user').unsigned()
            .references('users.id')
            .onUpdate('CASCADE')
            .onDelete('cascade')

        table.integer('level').notNullable();
        table.integer('experience').notNullable();
        table.integer('challenges_completed').notNullable();
    })
}

export async function down(knex: Knex){
    return knex.schema.dropTable('status')
}