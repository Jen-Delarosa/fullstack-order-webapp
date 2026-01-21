-- creating the table to orders
create table Orders(
    order_id int primary key auto_increment,
    cost int not null,
    from_name text not null,
    product text not null,
    status text not null,
    address text not null,
    quantity int not null,
    notes text,
    shipping text not null,
    order_date timestamp not null default current_timestamp
);
create table OrderHistories(
    id int primary key auto_increment,
    order_id int not null,
    shipping text not null,
    update_time timestamp not null default current_timestamp
);