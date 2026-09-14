#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成图片.py - 调用 jmrai.net 图片生成并保存到指定文件/目录

用法:
    python 生成图片.py --filename output.png --dir ./images
    python 生成图片.py -f hello.png -d E:/Projects/同桌的你/output
    python 生成图片.py --filename test.png --dir ./out --prompt "一只橘猫坐在课桌上，窗外阳光"

参数:
    -f, --filename   生成图片的文件名 (默认: output.png)
    -d, --dir        保存图片的目录 (默认: 当前目录 ./)
    -p, --prompt     图片描述词 (默认: Explain quantum entanglement in one paragraph.)
"""

import argparse
import os
import sys
import re
import base64
from pathlib import Path

from openai import OpenAI


def parse_args():
    parser = argparse.ArgumentParser(
        description="生成图片并保存到指定文件名和目录",
        formatter_class=argparse.RawTextHelpFormatter,
    )
    parser.add_argument(
        "-f", "--filename",
        type=str,
        default="output.png",
        help="生成图片的文件名，包含扩展名 (默认: output.png)\n示例: -f my_image.png",
    )
    parser.add_argument(
        "-d", "--dir",
        dest="output_dir",
        type=str,
        default=".",
        help="保存图片的目录 (默认: 当前目录 .)\n示例: -d ./images 或 -d E:/output",
    )
    # 额外：允许自定义提示词，不传则用原提示词
    parser.add_argument(
        "-p", "--prompt",
        type=str,
        default="Explain quantum entanglement in one paragraph.",
        help="图片/文本生成的提示词 (默认: 原代码中的英文提示词)",
    )
    parser.add_argument(
        "--api-key",
        type=str,
        default=None,
        help="API Key，默认读取环境变量 JMRAI_API_KEY / OPENAI_API_KEY，或使用代码中的占位符",
    )
    return parser.parse_args()


def ensure_dir(path: Path):
    """确保目录存在，不存在则创建"""
    path.mkdir(parents=True, exist_ok=True)


def save_image_from_b64(b64_str: str, save_path: Path):
    """保存 base64 图片"""
    # 去掉 data:image/png;base64, 前缀
    if "," in b64_str and "base64" in b64_str[:30]:
        b64_str = b64_str.split(",", 1)[1]
    # 去掉可能的空白/换行
    b64_str = re.sub(r"\s+", "", b64_str)
    data = base64.b64decode(b64_str)
    save_path.write_bytes(data)
    print(f"图片已保存: {save_path} ({len(data)} bytes)")


def main():
    args = parse_args()

    filename = args.filename.strip()
    output_dir = Path(args.output_dir).resolve()
    save_path = output_dir / filename

    # 目录自动创建
    ensure_dir(output_dir)
    # 如果 filename 本身包含子目录，也一并创建
    if save_path.parent != output_dir:
        ensure_dir(save_path.parent)

    # 兼容：文件名没有扩展名时补 .png
    if not save_path.suffix:
        save_path = save_path.with_suffix(".png")
        print(f"文件名无扩展名，已自动补全为: {save_path.name}")

    # API Key 优先级: 命令行 > 环境变量 > 占位符
    api_key = args.api_key or os.getenv("JMRAI_API_KEY") or os.getenv("OPENAI_API_KEY") or "<YOUR_API_KEY>"
    if api_key == "<YOUR_API_KEY>":
        print("警告: 未设置 API Key，请通过 --api-key 传入或设置环境变量 JMRAI_API_KEY", file=sys.stderr)

    client = OpenAI(
        base_url="https://jmrai.net/v1",
        api_key=api_key,
    )

    prompt = args.prompt

    # 优先尝试真正的图片生成接口 (images.generate)
    # 失败则回退到原有的 chat.completions 逻辑
    try:
        print(f"正在生成图片...\n  prompt: {prompt}\n  保存至: {save_path}")
        resp = client.images.generate(
            model="gpt-image-2-cheap",
            prompt=prompt,
            n=1,
        )
        data0 = resp.data[0]
        # 情况1: 返回 b64_json
        b64 = getattr(data0, "b64_json", None)
        if b64:
            save_image_from_b64(b64, save_path)
            return

        # 情况2: 返回 url
        url = getattr(data0, "url", None)
        if url:
            if url.startswith("data:"):
                save_image_from_b64(url, save_path)
                return
            # http url -> 下载
            import urllib.request
            print(f"图片 URL: {url}，正在下载...")
            urllib.request.urlretrieve(url, str(save_path))
            print(f"图片已保存: {save_path}")
            return

        # 情况3: 返回修订后的 prompt 等，打印原始响应
        print("未返回 b64/url，原始响应:")
        print(resp)
        # 同时把响应文本保存为 .txt 方便查看
        txt_path = save_path.with_suffix(".txt")
        txt_path.write_text(str(resp), encoding="utf-8")
        print(f"响应已另存为文本: {txt_path}")

    except Exception as e:
        # 图片接口不可用或报错，回退到 chat.completions
        msg = str(e)
        # 如果是明确的模型/接口不支持，打印后回退；否则也回退
        print(f"images.generate 调用失败，回退到 chat.completions: {e}", file=sys.stderr)

        try:
            completion = client.chat.completions.create(
                model="gpt-image-2-cheap",
                messages=[{"role": "user", "content": prompt}],
            )
            content = completion.choices[0].message.content
            print(content)

            # 尝试从返回内容中提取 base64 或 url 并保存为图片
            # 匹配 data:image 和 http 图片链接
            if content:
                # data URL
                m = re.search(r"data:image/[^;]+;base64,[A-Za-z0-9+/=\s]+", content)
                if m:
                    save_image_from_b64(m.group(0), save_path)
                    return
                # http 图片 url
                m2 = re.search(r"https?://[^\s\"')]+?\.(png|jpg|jpeg|webp)", content, re.I)
                if m2:
                    import urllib.request
                    url = m2.group(0)
                    print(f"从返回内容中提取到图片 URL: {url}，正在下载...")
                    urllib.request.urlretrieve(url, str(save_path))
                    print(f"图片已保存: {save_path}")
                    return

            # 无法提取图片时，将文本内容保存到目标路径（若目标是 .png 则另存 .txt）
            if save_path.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp"):
                txt_path = save_path.with_suffix(".txt")
                txt_path.write_text(content or "", encoding="utf-8")
                print(f"返回为文本内容，已保存至: {txt_path}")
            else:
                save_path.write_text(content or "", encoding="utf-8")
                print(f"内容已保存至: {save_path}")

        except Exception as e2:
            print(f"生成失败: {e2}", file=sys.stderr)
            sys.exit(1)


if __name__ == "__main__":
    main()
