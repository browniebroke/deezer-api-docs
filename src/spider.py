import json
from pathlib import Path

import environs
import pandas as pd
import scrapy

env = environs.Env()
env.read_env()

PROJECT_ROOT = Path(__file__).parents[1]
OUTPUT = PROJECT_ROOT / "output"


class DeezerDocsSpider(scrapy.Spider):
    name = "deezer_docs"
    start_urls = [
        "https://developers.deezer.com/api",
    ]
    session_id = env("DEEZER_SESSION_ID")

    def start_requests(self):
        for request in super().start_requests():
            request.cookies["sid"] = self.session_id
            yield request

    def parse(self, response):
        menu_left = response.css("div#menu_left")
        menu_items = menu_left.css("li")
        for item in menu_items:
            if "simpleapi_menuitem" in item.attrib.get("id", ""):
                next_page = item.css('a::attr("href")').get()
                if next_page is not None:
                    yield response.follow(next_page, self.parse_content_type)

    def parse_content_type(self, response):
        content_type_name = response.css("h1::text").get()
        interesting_divs = ["tab_infos", "tab_actions", "tab_connections"]
        content_type_data = dict.fromkeys(interesting_divs, "")
        for div_id in content_type_data:
            div = response.css(f"div#{div_id}")
            html_string = div.css("table").get()
            if html_string:
                df = pd.read_html(html_string)[0]
                df.fillna("", inplace=True)
                content_type_data[div_id] = df.to_dict("records")
        json_str = json.dumps(content_type_data, indent=2, ensure_ascii=False)
        resource_path = OUTPUT / f"{content_type_name.lower()}.json"
        resource_path.write_text(json_str + "\n")
        yield content_type_data
