import argparse
import subprocess
import sys
import os
from datetime import datetime
import shlex

# DP-Shield ASCII logo
ascii_art1 = """
                                                                                                                 
             ,-.----.                                                                                            
    ,---,    \    /  \                              .--.--.     ,---,                         ,--,               
  .'  .' `\  |   :    \                            /  /    '. ,--.' |      ,--,             ,--.'|         ,---, 
,---.'     \ |   |  .\ :            ,---,.        |  :  /`. / |  |  :    ,--.'|             |  | :       ,---.'| 
|   |  .`\  |.   :  |: |          ,'  .' |        ;  |  |--`  :  :  :    |  |,              :  : '       |   | : 
:   : |  '  ||   |   \ :        ,---.'   ,        |  :  ;_    :  |  |,--.`--'_       ,---.  |  ' |       |   | | 
|   ' '  ;  :|   : .   /        |   |    |         \  \    `. |  :  '   |,' ,'|     /     \ '  | |     ,--.__| | 
'   | ;  .  |;   | |`-'         :   :  .'           `----.   \|  |   /' :'  | |    /    /  ||  | :    /   ,'   | 
|   | :  |  '|   | ;            :   |.'             __ \  \  |'  :  | | ||  | :   .    ' / |'  : |__ .   '  /  | 
'   : | /  ; :   ' |            `---'              /  /`--'  /|  |  ' | :'  : |__ '   ;   /||  | '.'|'   ; |:  | 
|   | '` ,/  :   : :                              '--'.     / |  :  :_:,'|  | '.'|'   |  / |;  :    ;|   | '/  ' 
;   :  .'    |   | :                                `--'---'  |  | ,'    ;  :    ;|   :    ||  ,   / |   :    :| 
|   ,.'      `---'.|                                          `--''      |  ,   /  \   \  /  ---`-'   \   \  /   
'---'          `---`                                                      ---`-'    `----'             `----'    
                                                                                                                 

"""
ascii_art="""

██████╗ ██████╗               ███████╗██╗  ██╗██╗███████╗██╗     ██████╗ 
██╔══██╗██╔══██╗              ██╔════╝██║  ██║██║██╔════╝██║     ██╔══██╗
██║  ██║██████╔╝    █████╗    ███████╗███████║██║█████╗  ██║     ██║  ██║
██║  ██║██╔═══╝     ╚════╝    ╚════██║██╔══██║██║██╔══╝  ██║     ██║  ██║
██████╔╝██║                   ███████║██║  ██║██║███████╗███████╗██████╔╝
╚═════╝ ╚═╝                   ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚═════╝ 
                                                                         
"""

# ----------------- 配置映射 BEGIN -----------------
# 实验名称 -> 虚拟机 evaluation 目录下的子目录名
dir_map = {
    'classifier': 'classifier',
    'privacy_noise': 'privacy',
    'privacy_query': 'privacy',
    'related_video': 'related',
    'related_web': 'related',
    'video_bandwidth': 'video_bandwidth',
    'web_bandwidth': 'web_bandwidth'
}

# 实验名称 -> config 文件(不含 .json)
config_map = {
    'classifier': 'empirical_privacy',
    'privacy_noise': 'privacy_loss_vs_noise_std',
    'privacy_query': 'privacy_loss_vs_query_num',
    'related_video': 'overhead_comparison_video',
    'related_web': 'overhead_comparison_web',
    'video_bandwidth': 'dp_interval_vs_overhead_video',
    'web_bandwidth': 'dp_interval_vs_overhead_web'
}
# ----------------- 配置映射 END -------------------

BASE_DIR = "/mnt/hgfs/共享文件夹/netshaper/evaluation"


def build_command(exp_type: str) -> str:
    """根据实验类型构建后台运行的 shell 命令串"""
    if exp_type not in dir_map or exp_type not in config_map:
        raise ValueError(f"未知实验类型: {exp_type}")

    exp_dir = dir_map[exp_type]
    config_file = config_map[exp_type]
    cmd = (
        f"cd {BASE_DIR}/{exp_dir} && "
        f"nohup ./run.sh --experiment='{config_file}' "
        f"--config_file='configs/{config_file}.json' "
        f"> experiment_log.txt 2>&1 &"
    )
    return cmd


def run_experiment(exp_type: str):
    """执行实验"""
    command = build_command(exp_type)
    print(f"[INFO] {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} 准备执行: {command}")
    try:
        # 使用 bash 执行，以支持 &&、重定向等语法
        subprocess.run(command, shell=True, check=True, executable="/bin/bash")
        print("[SUCCESS] 实验已在后台启动，日志写入", os.path.join(BASE_DIR, dir_map[exp_type], "experiment_log.txt"))
    except subprocess.CalledProcessError as e:
        print("[ERROR] 命令执行失败:", e)
        sys.exit(1)


def stop_experiment():
    """停止所有 run.sh 后台任务"""
    cmd = "pkill -f run.sh"
    try:
        subprocess.run(cmd, shell=True, check=True, executable="/bin/bash")
        print("[SUCCESS] 已尝试终止 run.sh 相关进程")
    except subprocess.CalledProcessError as e:
        print("[ERROR] 终止失败或无相关进程:", e)


def tail_log(exp_type: str, lines: int = 20):
    """打印实验日志末尾若干行"""
    log_path = os.path.join(BASE_DIR, dir_map.get(exp_type, exp_type), "experiment_log.txt")
    if not os.path.exists(log_path):
        print("[WARN] 日志文件不存在:", log_path)
        return
    cmd = f"tail -n {lines} {log_path}"
    subprocess.run(cmd, shell=True, executable="/bin/bash")


def list_experiments():
    print("可用实验类型:\n" + "\n".join(sorted(dir_map.keys())))


def interactive_mode():
    """简易 REPL，使用户可连续执行 list / run / tail / stop 等指令"""
    print(ascii_art)
    print("DP-Shield: Differential Privacy-based Network Side-Channel Mitigation System\n")
    print('''网络数据包的大小和时间会泄漏用户隐私信息，被不法分子利用侧信道攻击捕捉并利用，因此我们提出基于差分隐私的网络侧信道缓解系统 DP-Shield，以应对加密流量形状泄漏隐私信息的攻击。该系统将流量整形建模为差分隐私问题，在主机侧设计了支持窗口化DP保证的自适应整形策略：在发送端利用缓冲队列和DP生成带噪声的塑形流量，通过 TQUIC 隧道传输 STREAM 帧，在接收端对流量去整形，实现双向独立整形，使攻击者无法从塑形流量中推断原始数据。该系统包含 Web 端可视化工具、命令行工具以及集成了整形功能的浏览器插件，不仅实时展示隐私参数与性能指标，还便于用户安装，实现了"安全-效率-体验" 的一体化集成。在安装 DP-Shield 后，原本能高精度识别加密流量内容的深度学习攻击被弱化至接近随机猜测水平。\n''')
    print("该命令行工具基于模拟器实验，帮助读者快速验证 DP-Shield 整形方案的安全性与效率。\n")

    print("交互模式已启动，输入 help 查看命令，exit/quit/q 退出。\n")

    help_text = (
        "可用指令:\n"
        "  list | l                      列出实验类型\n"
        "  run  | r  <实验名>            启动实验\n"
        "  tail | t  <实验名> [-n 行数]  查看日志 (默认20行)\n"
        "  stop | s                      终止所有实验\n"
        "  help | h                      显示帮助\n"
        "  quit | q | exit               退出交互模式\n"
    )

    while True:
        try:
            raw = input("dp-shield> ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\n退出交互模式。")
            break

        if not raw:
            continue

        tokens = shlex.split(raw)
        cmd = tokens[0].lower()

        # 退出
        if cmd in {"quit", "exit", "q"}:
            break
        # 帮助
        if cmd in {"help", "h"}:
            print(help_text)
            continue

        # 列表
        if cmd in {"list", "l"}:
            list_experiments()
            continue

        # 运行
        if cmd in {"run", "r"}:
            if len(tokens) < 2:
                print("用法: run <实验名>")
                continue
            exp = tokens[1]
            if exp not in dir_map:
                print("未知实验: ", exp)
                continue
            run_experiment(exp)
            continue

        # tail
        if cmd in {"tail", "t"}:
            if len(tokens) < 2:
                print("用法: tail <实验名> [-n 行数]")
                continue
            exp = tokens[1]
            n = 20
            if "-n" in tokens:
                try:
                    idx = tokens.index("-n")
                    n = int(tokens[idx + 1])
                except (ValueError, IndexError):
                    print("-n 后需跟整数行数")
                    continue
            tail_log(exp, n)
            continue

        # stop
        if cmd in {"stop", "s"}:
            stop_experiment()
            continue

        print("未知指令, 输入 help 查看帮助")


def main():
    parser = argparse.ArgumentParser(description="DP-Shield 实验运行工具", add_help=False)
    parser.add_argument('-h', '--help', action='help', help='显示此帮助信息并退出')
    subparsers = parser.add_subparsers(dest="command")

    # run 子命令
    run_parser = subparsers.add_parser("run", help="启动实验")
    run_parser.add_argument("exp_type", choices=dir_map.keys(), help="实验类型")

    # stop 子命令
    subparsers.add_parser("stop", help="终止实验 (pkill -f run.sh)")

    # tail 子命令
    tail_parser = subparsers.add_parser("tail", help="查看实验日志")
    tail_parser.add_argument("exp_type", choices=dir_map.keys(), help="实验类型")
    tail_parser.add_argument("-n", "--lines", type=int, default=20, help="查看日志末尾行数 (默认 20)")

    # list 子命令
    subparsers.add_parser("list", help="列出支持的实验类型")

    # 若无参数则进入交互模式
    if len(sys.argv) == 1 or args.command is None:
        interactive_mode()
        return

    args = parser.parse_args()

    if args.command == "run":
        run_experiment(args.exp_type)
    elif args.command == "stop":
        stop_experiment()
    elif args.command == "tail":
        tail_log(args.exp_type, args.lines)
    elif args.command == "list":
        list_experiments()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()

"""
  _____  _____              _____ _     _      _     _ 
 |  __ \|  __ \            / ____| |   (_)    | |   | |
 | |  | | |__) |  ______  | (___ | |__  _  ___| | __| |
 | |  | |  ___/  |______|  \___ \| '_ \| |/ _ \ |/ _` |
 | |__| | |                ____) | | | | |  __/ | (_| |
 |_____/|_|               |_____/|_| |_|_|\___|_|\__,_|
                                                       
                                                       
"""
"""
    ____  ____              _____ __    _      __    __
   / __ \/ __ \            / ___// /_  (_)__  / /___/ /
  / / / / /_/ /  ______    \__ \/ __ \/ / _ \/ / __  / 
 / /_/ / ____/  /_____/   ___/ / / / / /  __/ / /_/ /  
/_____/_/                /____/_/ /_/_/\___/_/\__,_/   
                                                       
"""
"""
 _____     ______         ______     __  __     __     ______     __         _____    
/\  __-.  /\  == \       /\  ___\   /\ \_\ \   /\ \   /\  ___\   /\ \       /\  __-.  
\ \ \/\ \ \ \  _-/       \ \___  \  \ \  __ \  \ \ \  \ \  __\   \ \ \____  \ \ \/\ \ 
 \ \____-  \ \_\          \/\_____\  \ \_\ \_\  \ \_\  \ \_____\  \ \_____\  \ \____- 
  \/____/   \/_/           \/_____/   \/_/\/_/   \/_/   \/_____/   \/_____/   \/____/ 
                                                                                      
"""
"""
 ________  ________                           ________  ___  ___  ___  _______   ___       ________     
|\   ___ \|\   __  \                         |\   ____\|\  \|\  \|\  \|\  ___ \ |\  \     |\   ___ \    
\ \  \_|\ \ \  \|\  \      ____________      \ \  \___|\ \  \\\  \ \  \ \   __/|\ \  \    \ \  \_|\ \   
 \ \  \ \\ \ \   ____\    |\____________\     \ \_____  \ \   __  \ \  \ \  \_|/_\ \  \    \ \  \ \\ \  
  \ \  \_\\ \ \  \___|    \|____________|      \|____|\  \ \  \ \  \ \  \ \  \_|\ \ \  \____\ \  \_\\ \ 
   \ \_______\ \__\                              ____\_\  \ \__\ \__\ \__\ \_______\ \_______\ \_______\
    \|_______|\|__|                             |\_________\|__|\|__|\|__|\|_______|\|_______|\|_______|
                                                \|_________|                                            
                                                                                                        
                                                                                                        
"""
"""
██████  ██████                ███████ ██   ██ ██ ███████ ██      ██████  
██   ██ ██   ██               ██      ██   ██ ██ ██      ██      ██   ██ 
██   ██ ██████      █████     ███████ ███████ ██ █████   ██      ██   ██ 
██   ██ ██                         ██ ██   ██ ██ ██      ██      ██   ██ 
██████  ██                    ███████ ██   ██ ██ ███████ ███████ ██████  
                                                                         
                                                                         
"""
"""
██████╗ ██████╗               ███████╗██╗  ██╗██╗███████╗██╗     ██████╗ 
██╔══██╗██╔══██╗              ██╔════╝██║  ██║██║██╔════╝██║     ██╔══██╗
██║  ██║██████╔╝    █████╗    ███████╗███████║██║█████╗  ██║     ██║  ██║
██║  ██║██╔═══╝     ╚════╝    ╚════██║██╔══██║██║██╔══╝  ██║     ██║  ██║
██████╔╝██║                   ███████║██║  ██║██║███████╗███████╗██████╔╝
╚═════╝ ╚═╝                   ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚═════╝ 
                                                                         
"""