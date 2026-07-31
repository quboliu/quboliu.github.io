---
lang: "zh-CN"
pubDatetime: 2024-08-21T15:12:06+08:00
modDatetime: 2024-08-21T20:57:45+08:00
timezone: "Asia/Shanghai"
title: "postgresql系列之编译安装-步骤拆解"
featured: false
draft: false
tags: []
description: "说明："
---

# postgresql系列之编译安装-步骤拆解

- 基本按照这个步骤来的：<a href="https://blog.frognew.com/2021/11/postgresql-get-started.html" rel="noopener" target="_blank">https://blog.frognew.com/2021/11/postgresql-get-started.html</a>
- 本文目的不仅仅在于普通的安装，而更加侧重于“是什么”，“为什么”。
- 我这一步在安装什么？我为什么要这么安装？必要吗？这一步的配置可选吗？等等问题。

---

### 正式步骤

#### 一. 下载源码包并解压

```shell
curl -O -k https://ftp.postgresql.org/pub/source/v16.1/postgresql-16.1.tar.gz
```

```plaintext
tar -zxvf postgresql-16.1.tar.gz
```

**说明：**

下载解压没有什么好说的。curl和tar的用法自己去看。

#### 二. 安装编译工具及相关依赖

```shell
sudo apt install make gcc bison g++ libreadline-dev \
  zlib1g zlib1g-dev perl libperl-dev libsystemd-dev libicu-dev acl
```

**说明，依次介绍一下这些库：**

- make：自动化编译工具，用于管理和构建大型程序。

- gcc：GNU Compiler Collection，主要用于编译C

- bision：GNU的语法分析器生成器,用于创建解析器。

- g++:

  - GCC的C++编译器。

- libreadline-dev:

  - GNU readline库的开发文件,用于命令行编辑和历史功能。

- zlib1g 和 zlib1g-dev:

  - 数据压缩库及其开发文件。

- perl:

  - 广泛使用的脚本语言。

- libperl-dev:

  - Perl语言的开发库。

- libsystemd-dev:

  - systemd系统和服务管理器的开发库。

- libicu-dev:

  - International Components for Unicode (ICU)库的开发文件,用于Unicode和全球化支持。

- acl:

  - Access Control Lists,用于文件系统的访问控制。

RedHat系相关的命令是：

```shell
sudo yum install -y make gcc bison gcc-c++ readline readline-devel zlib zlib-devel systemd-devel libicu-devel
```

#### 三. 在服务器上额外创建postgres用户

```shell
useradd -m postgres
```

下面是创建postgresql相关目录：

```shell
mkdir /home/postgres/data
mkdir /home/postgres/init
chown -R postgres:postgres /home/postgres
```

**命令说明：**

- 这边为什么要单独为postgres设置一个用户呢。

- `/home/postgres/data`是可以作为数据库的数据目录

- ` /home/postgres/init`的用处(可能)

  - 初始化脚本：可能包含在PostgreSQL服务启动时需要执行的SQL脚本或shell脚本。
  - 配置文件：可能存储一些自定义的配置文件。
  - 临时文件：在数据库初始化过程中可能用到的临时文件。

#### 四. 编译安装PostgreSQL

```shell
cd postgresql-16.1
```

```shell
export LD_LIBRARY_PATH=/usr/lib
```

```shell
./configure --with-pgport=5432 \
  --prefix=/usr/local/pgsql \
  --with-systemd \
  --with-segsize=16 \
  --with-blocksize=8 \
  --with-wal-blocksize=8 \
  --datadir=/home/postgres/init
```

可能有个疑问，原文中的这个datadir选项是不是搞错了，为什么设置成为init。别急，其实没搞错。

```shell
make
```

```shell
sudo make install
```

**说明：**

- `LD_LIBRARY_PATH`是一个用于指定动态链接库（shared library）的搜索路径的环境变量。当程序启动时，动态链接器会在这些目录中查找程序所需的共享库。

- `--with-pgport=5432`

  设置PostgreSQL服务器的默认监听端口为5432

- `--prefix=/usr/local/pgsql`

  指定安装目录的前缀路径,PostgreSQL将安装到这个目录下。

- `--with-systemd`

  启用systemd支持,允许使用systemd管理PostgreSQL服务

- `--with-segsize=SEGSIZE`设置数据库段大小（以GB为单位）。大型表分为多个操作系统文件，每个文件的大小等于段大小。建议（尽管不是绝对必需）此值为2的幂。这样可以避免许多平台上存在的文件大小限制问题。默认段大小1GB，在所有受支持的平台上都是安全的。如果您的操作系统具有“大文件”支持（现在大多数都支持），则可以使用更大的段大小。这有助于减少处理非常大的表时消耗的文件描述符数。请注意，更改此值会破坏磁盘上的数据库兼容性，这意味着您无法用于 pg_upgrade 升级到具有不同段大小的内部版本。

- `--with-blocksize=BLOCKSIZE`设置块大小（以KB为单位）。这是表中的存储和I/O单元，是数据存储的基本单位。默认值8KB适用于大多数情况;但其他值在特殊情况下可能有用。该值必须是介于1和32（千字节）之间的2次幂。请注意，更改此值会破坏磁盘上的数据库兼容性，这意味着您无法用于pg_upgrade升级到具有不同块大小的生内部版本。

- `--with-wal-blocksize=WALBLOCKSIZE`设置WAL(预写式日志)块大小（以KB为单位）。这是WAL日志中的存储和 I/O 单元。默认值8KB适用于大多数情况;但其他值在特殊情况下可能有用。该值必须是介于1和64（千字节）之间的2次方。请注意，更改此值会破坏磁盘数据库兼容性，这意味着您无法用于 pg_upgrade 升级到具有不同WAL块大小的版本。

- 指定数据目录的位置。注意,这通常用于指定实际的数据存储位置,而不是初始化脚本目录。

#### 五. 初始化数据库设置

首先切换到`postgres`用户中：

```shell
su - postgres
```

```shell
/usr/local/pgsql/bin/initdb -D /home/postgres/data
```

创建systemd配置文件`/etc/systemd/system/postgresql.service`:

如果在postgres用户下的话，不要忘了在一个别的具有sudo权限的账户下将其加入sudo用户组：

```shell
sudo usermod -aG sudo postgres
```

ok，接下来继续操作

```shell
sudo vim /etc/systemd/system/postgresql.service
```

文件内容为：

```shell
[Unit]
Description=PostgreSQL database server
Documentation=man:postgres(1)
After=network-online.target
Wants=network-online.target

[Service]
Type=notify
User=postgres
ExecStart=/usr/local/pgsql/bin/postgres -D /home/postgres/data
ExecReload=/bin/kill -HUP $MAINPID
KillMode=mixed
KillSignal=SIGINT

[Install]
WantedBy=multi-user.target
```

配置开机启动并启动PostgreSQL：

```shell
systemctl enable postgresql --now
```

查看postgresql运行状态：

```shell
systemctl status postgresql
```

> 原博客中的配图资源缺失（文件：https://4blog.s3.bitiful.net/20240821151641.png）。

**说明：**

1.  关于initdb工具

    > 这行命令是用来初始化PostgreSQL数据库集群的。让我详细解释一下：
    >
    > `/usr/local/pgsql/bin/initdb -D /home/postgres/data`
    >
    > 1.  `/usr/local/pgsql/bin/initdb`
    >
    >     - 这是PostgreSQL的`initdb`工具的完整路径。
    >     - `initdb`是用来初始化一个新的PostgreSQL数据库集群的工具。
    >
    > 2.  `-D /home/postgres/data`
    >
    >     - `-D`选项用来指定数据目录的位置。
    >     - `/home/postgres/data`是新数据库集群将要创建的目录。
    >
    > 这个命令的作用是：
    >
    > 1.  创建数据目录：如果`/home/postgres/data`目录不存在，它会被创建。
    > 2.  初始化数据库集群：在指定的目录中创建所有必要的子目录和文件。
    > 3.  创建系统表：初始化PostgreSQL所需的系统表和视图。
    > 4.  创建模板数据库：设置`template0`和`template1`数据库。
    > 5.  生成配置文件：在数据目录中创建初始的`postgresql.conf`和`pg_hba.conf`文件。
    > 6.  设置默认区域设置：根据系统环境设置默认的字符集和排序规则。
    > 7.  创建初始用户：通常会创建一个超级用户，默认名称通常是运行这个命令的系统用户名。
    >
    > 执行这个命令后，一个新的PostgreSQL数据库集群就准备好了，可以启动PostgreSQL服务器并开始创建数据库和表了。
    >
    > 注意：
    >
    > - 运行这个命令的用户需要有足够的权限来创建和写入指定的数据目录。
    > - 数据目录应该是空的，或者不存在（命令会创建它）。
    > - 这个命令只需要在首次设置PostgreSQL时运行一次。之后的日常操作不需要重复执行这个命令。

#### 六. 生成简易一键安装脚本

就是简单的组合一下，倒也没什么用处，主要是为了便于我看。主要是有助于一目了然。

```shell
curl -O -k https://ftp.postgresql.org/pub/source/v16.1/postgresql-16.1.tar.gz

tar -zxvf postgresql-16.1.tar.gz

sudo apt install make gcc bison g++ libreadline-dev \
  zlib1g zlib1g-dev perl libperl-dev libsystemd-dev libicu-dev acl

useradd -m postgres

mkdir /home/postgres/data && mkdir /home/postgres/init
chown -R postgres:postgres /home/postgres

cd postgresql-16.1

export LD_LIBRARY_PATH=/usr/lib

./configure --with-pgport=5432 \
  --prefix=/usr/local/pgsql \
  --with-systemd \
  --with-segsize=16 \
  --with-blocksize=8 \
  --with-wal-blocksize=8 \
  --datadir=/home/postgres/init

make

sudo make install

sudo usermod -aG sudo postgres

su - postgres

/usr/local/pgsql/bin/initdb -D /home/postgres/data

# 注意, 下面的写法会覆盖文件。
sudo tee /etc/systemd/system/postgresql.service << EOF
[Unit]
Description=PostgreSQL database server
Documentation=man:postgres(1)
After=network-online.target
Wants=network-online.target

[Service]
Type=notify
User=postgres
ExecStart=/usr/local/pgsql/bin/postgres -D /home/postgres/data
ExecReload=/bin/kill -HUP \$MAINPID
KillMode=mixed
KillSignal=SIGINT

[Install]
WantedBy=multi-user.target
EOF

systemctl enable postgresql --now

systemctl status postgresql
```

基本流程是这样，现在我们让GPT润色一下：

```shell
请你润色如下脚本，1. 整个shell脚本要显得更加专业。 2. 让部分实现更加优雅一点
3. 请你在标准输出和日志中记录，说明每一步都在做什么。4. 增强整体脚本的健壮性。
```

###### DeepSeek的原结果

```shell
#!/bin/bash

# 设置日志文件路径
LOG_FILE="/var/log/postgresql_install.log"

# 函数：记录日志并输出到标准输出
log_info() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

# 函数：错误处理
handle_error() {
    log_info "错误：$1"
    exit 1
}

log_info "开始安装 PostgreSQL 16.1"

# 下载 PostgreSQL 源码包
log_info "下载 PostgreSQL 源码包..."
curl -O -k https://ftp.postgresql.org/pub/source/v16.1/postgresql-16.1.tar.gz || handle_error "下载失败"

# 解压源码包
log_info "解压源码包..."
tar -zxvf postgresql-16.1.tar.gz || handle_error "解压失败"

# 安装依赖包
log_info "安装依赖包..."
sudo apt update && sudo apt install -y make gcc bison g++ libreadline-dev zlib1g zlib1g-dev perl libperl-dev libsystemd-dev libicu-dev acl || handle_error "依赖包安装失败"

# 创建 postgres 用户和数据目录
log_info "创建 postgres 用户和数据目录..."
useradd -m postgres || handle_error "创建用户失败"
mkdir -p /home/postgres/data /home/postgres/init || handle_error "创建目录失败"
chown -R postgres:postgres /home/postgres || handle_error "修改目录权限失败"

# 编译和安装 PostgreSQL
cd postgresql-16.1 || handle_error "进入源码目录失败"
log_info "配置编译选项..."
export LD_LIBRARY_PATH=/usr/lib
./configure --with-pgport=5432 --prefix=/usr/local/pgsql --with-systemd --with-segsize=16 --with-blocksize=8 --with-wal-blocksize=8 --datadir=/home/postgres/init || handle_error "配置失败"
log_info "编译源码..."
make || handle_error "编译失败"
log_info "安装 PostgreSQL..."
sudo make install || handle_error "安装失败"

# 将 postgres 用户添加到 sudo 用户组
log_info "将 postgres 用户添加到 sudo 用户组..."
sudo usermod -aG sudo postgres || handle_error "添加用户到 sudo 用户组失败"

# 初始化数据库
log_info "初始化数据库..."
su - postgres -c "/usr/local/pgsql/bin/initdb -D /home/postgres/data" || handle_error "初始化数据库失败"

# 创建 systemd 服务文件
log_info "创建 systemd 服务文件..."
sudo tee /etc/systemd/system/postgresql.service << EOF
[Unit]
Description=PostgreSQL database server
Documentation=man:postgres(1)
After=network-online.target
Wants=network-online.target

[Service]
Type=notify
User=postgres
ExecStart=/usr/local/pgsql/bin/postgres -D /home/postgres/data
ExecReload=/bin/kill -HUP \$MAINPID
KillMode=mixed
KillSignal=SIGINT

[Install]
WantedBy=multi-user.target
EOF

# 启动并启用 PostgreSQL 服务
log_info "启动并启用 PostgreSQL 服务..."
sudo systemctl enable postgresql --now || handle_error "启动服务失败"
sudo systemctl status postgresql || handle_error "检查服务状态失败"

log_info "PostgreSQL 16.1 安装完成"
```

###### ChatGPT的原结果：

```shell
#!/bin/bash

# 设置脚本出错时终止执行
set -euo pipefail

# 定义日志文件
LOG_FILE="/var/log/postgresql_install.log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "开始安装 PostgreSQL 16.1"

# 下载并验证 PostgreSQL 源码包
POSTGRES_URL="https://ftp.postgresql.org/pub/source/v16.1/postgresql-16.1.tar.gz"
echo "Downloading PostgreSQL 16.1 from $POSTGRES_URL"
if curl -fLO "$POSTGRES_URL"; then
    echo "PostgreSQL 16.1 下载成功"
else
    echo "下载失败，请检查网络连接或 URL 是否正确" >&2
    exit 1
fi

# 解压源码包
echo "解压 PostgreSQL 源码包..."
tar -zxf postgresql-16.1.tar.gz

# 安装依赖包
echo "安装必要的依赖包..."
sudo apt update
sudo apt install -y make gcc bison g++ libreadline-dev zlib1g-dev perl libperl-dev libsystemd-dev libicu-dev acl

# 添加 postgres 用户
echo "创建 postgres 用户..."
if id "postgres" &>/dev/null; then
    echo "postgres 用户已存在，跳过创建"
else
    sudo useradd -m -s /bin/bash postgres
fi

# 创建数据目录和初始化目录
echo "创建数据目录和初始化目录..."
sudo mkdir -p /home/postgres/data /home/postgres/init
sudo chown -R postgres:postgres /home/postgres

# 配置 PostgreSQL
echo "开始配置 PostgreSQL..."
cd postgresql-16.1
export LD_LIBRARY_PATH=/usr/lib
./configure --with-pgport=5432 --prefix=/usr/local/pgsql --with-systemd --with-segsize=16 --with-blocksize=8 --with-wal-blocksize=8 --datadir=/home/postgres/init

# 编译并安装 PostgreSQL
echo "编译并安装 PostgreSQL..."
make -j "$(nproc)"
sudo make install

# 将 postgres 用户添加到 sudo 组
echo "将 postgres 用户添加到 sudo 组..."
sudo usermod -aG sudo postgres

# 初始化数据库
echo "初始化数据库..."
sudo -i -u postgres /usr/local/pgsql/bin/initdb -D /home/postgres/data

# 创建 systemd 服务文件
echo "配置 PostgreSQL systemd 服务..."
sudo tee /etc/systemd/system/postgresql.service > /dev/null <<EOF
[Unit]
Description=PostgreSQL database server
Documentation=man:postgres(1)
After=network-online.target
Wants=network-online.target

[Service]
Type=notify
User=postgres
ExecStart=/usr/local/pgsql/bin/postgres -D /home/postgres/data
ExecReload=/bin/kill -HUP \$MAINPID
KillMode=mixed
KillSignal=SIGINT

[Install]
WantedBy=multi-user.target
EOF

# 启用并启动 PostgreSQL 服务
echo "启用并启动 PostgreSQL 服务..."
sudo systemctl daemon-reload
sudo systemctl enable --now postgresql

# 检查 PostgreSQL 服务状态
echo "检查 PostgreSQL 服务状态..."
if sudo systemctl status postgresql | grep -q "active (running)"; then
    echo "PostgreSQL 已成功启动并运行"
else
    echo "PostgreSQL 启动失败，请检查日志以获取更多信息" >&2
    exit 1
fi

echo "PostgreSQL 16.1 安装和配置完成"
```

最终的可用版本：

- ☐ 这边我还没有验证，这边我只保证一个成功的结果有了就可以了。

  别的坑不管了，不管什么健壮性。

```shell
代码待写...TODO
```

### 参考文献

1.  <a href="https://blog.frognew.com/2023/11/install-postgresql-16-from-source-code.html" rel="noopener" target="_blank">https://blog.frognew.com/2023/11/install-postgresql-16-from-source-code.html</a>

### 附录

##### 1. libicu缺失的问题

AGS_SL_MODULE… yes  
checking whether the C compiler still works… yes  
checking how to run the C preprocessor… gcc -E  
checking for pkg-config… no  
checking allow thread-safe client libraries… yes  
checking whether to build with ICU support… yes  
checking for icu-uc icu-i18n… no  
configure: error: ICU library not found  
If you have ICU already installed, see config.log for details on the  
failure. It is possible the compiler isn’t looking in the proper directory.  
Use –without-icu to disable ICU support.

```shell
sudo apt install libicu-dev
```

```shell
sudo apt install libicu70
```

哪个命令起作用了，我也不太清楚。

1.  安装之后，在执行`./configure`之前，不要忘记搞这个：

    ```shell
    export LD_LIBRARY_PATH=/usr/lib
    ```

2.  在`make install`前面不要忘记加上sudo

    也就是`sudo make install`

3.  下面是某个流程：

    > guodalu@PC:~/postgresql-16.1\$ su - postgres  
    > Password:  
    > Welcome to Ubuntu 22.04.4 LTS (GNU/Linux 5.15.153.1-microsoft-standard-WSL2 x86_64)
    >
    > - Documentation: <a href="https://help.ubuntu.com/" rel="noopener" target="_blank">https://help.ubuntu.com</a>
    > - Management: <a href="https://landscape.canonical.com/" rel="noopener" target="_blank">https://landscape.canonical.com</a>
    > - Support: <a href="https://ubuntu.com/pro" rel="noopener" target="_blank">https://ubuntu.com/pro</a>
    >
    > This message is shown once a day. To disable it please create the  
    > /home/postgres/.hushlogin file.  
    > \$ /usr/local/pgsql/bin/initdb -D /home/postgres/data  
    > The files belonging to this database system will be owned by user “postgres”.  
    > This user must also own the server process.
    >
    > The database cluster will be initialized with locale “C.UTF-8”.  
    > The default database encoding has accordingly been set to “UTF8”.  
    > The default text search configuration will be set to “english”.
    >
    > Data page checksums are disabled.
    >
    > fixing permissions on existing directory /home/postgres/data … ok  
    > creating subdirectories … ok  
    > selecting dynamic shared memory implementation … posix  
    > selecting default max_connections … 100  
    > selecting default shared_buffers … 128MB  
    > selecting default time zone … Asia/Shanghai  
    > creating configuration files … ok  
    > running bootstrap script … ok  
    > performing post-bootstrap initialization … ok  
    > syncing data to disk … ok
    >
    > initdb: warning: enabling “trust” authentication for local connections  
    > initdb: hint: You can change this by editing pg_hba.conf or using the option -A, or –auth-local and –auth-host, the next time you run initdb.
    >
    > Success. You can now start the database server using:
    >
    >     /usr/local/pgsql/bin/pg_ctl -D /home/postgres/data -l logfile start

4.

##### 2. postgres账户下的两个目录的作用，联系和区别

```txt
/usr/local/pgsql/bin/initdb -D /home/postgres/data 中的路径和./configure --with-pgport=5432 --prefix=/usr/local/pgsql --with-systemd --with-segsize=16 --with-blocksize=8 --with-wal-blocksize=8 --datadir=/home/postgres/init中的datadir的区别和联系是什么
```

> 你提出了一个很好的问题。这两个命令中的路径确实容易引起混淆。让我来解释它们的区别和联系：
>
> 1.  `./configure` 命令中的 `--datadir=/home/postgres/init`：
>
>     - 在 `configure` 脚本中，`--datadir` 通常用于指定安装时的默认数据目录。
>     - 然而，这个参数在 PostgreSQL 的 `configure` 脚本中的作用有些特殊。它主要影响一些辅助文件（如文档、示例配置文件等）的安装位置，而不是实际的数据存储位置。
>     - 这个设置不会直接决定运行时数据库集群的位置。
>
> 2.  `initdb` 命令中的 `-D /home/postgres/data`：
>
>     - 这个参数直接指定了实际数据库集群的位置。
>     - 这是 PostgreSQL 将存储所有数据文件、配置文件和日志文件的地方。
>
> 区别：
>
> - `configure` 中的 `--datadir` 主要影响安装过程和某些默认路径。
> - `initdb` 中的 `-D` 指定实际运行时数据库集群的位置。
>
> 联系：
>
> - 虽然这两个路径可以设置为相同，但通常它们是不同的。
> - `configure` 的 `--datadir` 可能会影响一些默认配置文件中的路径设置，但不会直接决定数据库集群的位置。
>
> 最佳实践：
>
> 1.  使用 `configure` 的 `--datadir` 来设置辅助文件的安装位置。
> 2.  使用 `initdb -D` 来明确指定实际的数据库集群位置。
> 3.  在生产环境中，通常会将实际的数据目录（通过 `initdb -D` 指定）设置在一个有足够空间和适当权限的位置。
>
> 注意：在你的例子中，`/home/postgres/init` 和 `/home/postgres/data` 是两个不同的目录。确保你理解它们的不同用途，并在实际操作中正确使用。
>
> ———————————————————————————来自Claude

##### 3. /etc/systemd/system/postgresql.service文件说明

> 这个文件是一个systemd服务单元配置文件，用于管理PostgreSQL数据库服务。让我逐行解释：
>
> \[Unit\] 部分:
>
> 1.  `Description=PostgreSQL database server`
>
>     - 描述这个服务单元的用途。
>
> 2.  `Documentation=man:postgres(1)`
>
>     - 指向服务的文档，这里是postgres的man页。
>
> 3.  `After=network-online.target`
>
>     - 指定这个服务应该在网络在线后启动。
>
> 4.  `Wants=network-online.target`
>
>     - 表示这个服务想要（但不强制要求）网络在线。
>
> \[Service\] 部分:  
> 5. `Type=notify`
>
> - 指定服务类型为notify，意味着服务会在就绪时通知systemd。
>
> 6.  `User=postgres`
>
>     - 指定运行服务的用户为postgres。
>
> 7.  `ExecStart=/usr/local/pgsql/bin/postgres -D /home/postgres/data`
>
>     - 指定启动服务时执行的命令，这里是启动PostgreSQL服务器。
>
> 8.  `ExecReload=/bin/kill -HUP $MAINPID`
>
>     - 指定重新加载服务时执行的命令。
>
> 9.  `KillMode=mixed`
>
>     - 指定如何停止服务，mixed模式会先尝试优雅停止，然后再强制终止。
>
> 10. `KillSignal=SIGINT`
>
>     - 指定用于停止服务的信号。
>
> \[Install\] 部分:  
> 11. `WantedBy=multi-user.target`
>
> - 指定这个服务应该在哪个target（一组服务）下启用，这里是多用户模式。
>
> 这个配置文件定义了PostgreSQL服务如何被systemd管理，包括启动、停止、重载等操作。它确保PostgreSQL在系统启动时正确启动，并在系统关闭时正确停止。
>
> ——————————————————————————————Claude
