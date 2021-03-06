const log = console.log;
window.addEventListener('load', () => {
    let app = new App();
});



class App {
    constructor() {
        this.json;
        this.datas;
        this.is_visual = true;
        this.$now_page = $('.main_container .main');
        // this.$now_page = $('.main_container .fund_register');
        // this.$now_page = $('.main_container .fund_view');
        // this.$now_page = $('.main_container .investor_list');
        this.$now_page.data('idx', 0);
        this.$now_page.show();
        this.is_moveing = false;

        this.$item_list = $(".fund_view .item_list");
        this.$item_list.data("page", 1);

        this.$popup = $('.popup');
        this.$popup.hide();
        this.$canvas = this.$popup.find("canvas")[0];
        log(this.$canvas);
        this.$canvas.width = 530;
        this.$canvas.height = 200;
        this.$ctx = this.$canvas.getContext("2d");
        this.$ctx.lineWidth = 3;
        this.$ctx.strokeStyle = "#000";
        this.$ctx.lineCap = "round";
        this.$ctx.lineJoin = "round";
        this.is_drawing = false;
        this.draing_ok = false;
        this.prex = -1;
        this.prey = -1;

        this.investor_list = [];
        this.$tbody = $('.investor_list table tbody');
        this.$tbody.data("page", 1);
        this.init();
    }


    async init() {
        this.json = await this.getJSON();
        this.datas = this.getDatas();
        this.sortData();
        log(this.datas);

        this.setMainEvent();
        this.setFundRegisterEvent();
        this.setFundViewEvent();
        this.setInvestorListEvent();
        this.loadMain();
    }


    loadMain() {
        this.sortData();
        let view_list = this.datas.filter(x => new Date() < new Date(x.endDate));

        view_list = view_list.slice(0, 4);
        view_list.forEach((item, idx) => {
            $('.main .item_list .item').eq(idx).find(".main_percent").html(item.percent + '%');
            $('.main .item_list .item').eq(idx).find(".main_name").html(item.xss_name);
            $('.main .item_list .item').eq(idx).find(".main_name").attr("title", item.name);
            $('.main .item_list .item').eq(idx).find(".main_end").html(item.endDate);
            $('.main .item_list .item').eq(idx).find(".main_current").html(item.str_current + '원 펀딩');
            $('.main .item_list .item').eq(idx).find(".main_current").attr("title", item.str_current + '원 펀딩');
        });

        $('.main .item0').css("margin-left", "-300px");
        $('.main .item1').css("margin-left", "-600px");
        $('.main .item3').css("margin-top", "-300px");
        $('.main .item4').css("margin-left", "-600px");
        $('.main .text').hide();
        setTimeout(() => {
            $('.main .item0').animate({ "margin-left": "0" }, 800);
            $('.main .item1').animate({ "margin-left": "0" }, 1600);
            $('.main .item3').animate({ "margin-top": "0" }, 800);
            $('.main .item4').animate({ "margin-left": "0" }, 800);
            $('.main .text').fadeIn(800);
        }, 500);
    }

    loadFundRegister() {
        let ran_text = this.getRandomText();
        $('.fund_register .reg_fund_num').html(ran_text);
        $('.fund_register input').val('');
    }

    loadFundView() {
        // 펀드보기 로그
        this.sortData();
        let page = this.$item_list.data("page");
        this.$item_list.fadeOut(500);
        setTimeout(() => {
            const ITEM_COUNT = 6;
            const BTN_COUNT = 5;

            let total_page = Math.ceil(this.datas.length / ITEM_COUNT);
            let current_block = Math.ceil(page / BTN_COUNT);

            let start = current_block * BTN_COUNT - BTN_COUNT + 1;
            start = start < 1 ? 1 : start;
            let end = start + BTN_COUNT - 1;
            end = end >= total_page ? total_page : end;

            let prev = start > 1;
            let next = end < total_page;
            let start_idx = (page - 1) * ITEM_COUNT;
            let end_idx = start_idx + ITEM_COUNT;

            let view_list = this.datas.slice(start_idx, end_idx);
            let htmlBtns = ` <div class="num ${prev ? '' : 'disable'}" data-page='${prev ? start - 1 : 'no'}'><i class="fas fa-chevron-left"></i></div>`;
            for (let i = start; i <= end; i++) {
                htmlBtns += `   <div class="num ${page == i ? 'active' : ''}" data-page="${i}">${i}</div>`;
            }
            htmlBtns += `<div class="num  ${next ? '' : 'disable'}" data-page='${next ? end + 1 : 'no'}'><i class="fas fa-chevron-right"></i></div>`;
            $('.view_pagination_group').html(htmlBtns);
            this.$item_list.empty();
            view_list.forEach(x => {
                let dom = this.makeFundDom(x);
                this.$item_list.append(dom);
            });
            view_list.forEach((item, idx) => {
                setTimeout(() => {
                    this.$item_list.find(".item").eq(idx).find(".bar").animate({ "width": item.percent >= 100 ? 100 + '%' : item.percent + '%' }, 2000);
                }, 300);

            });
            this.$item_list.fadeIn();
        }, 500);
    }

    makeFundDom(x) {
        return `
                        <div class="item">
                            <img src="images/optimize.jpg" alt="">
                            <span class="view_num">${x.number}</span>
                            <div class="view_name color_000 font_17 fw_500 text_over m_t_10" title="${x.xss_name}">${x.xss_name}</div>
                            <div class="view_percent color_blue font_22 fw_600 flex flex_a_c text_over m_t_20" title="${x.percent}">
                                ${x.percent}%
                                <div class="color_999 font_13 fw_500 m_l_10 text_over" title="${x.str_current}원 / ${x.str_total}원">${x.str_current}원 / ${x.str_total}원</div>
                            </div>
                            <div class="view_end color_999 font_13 fw_500 m_t_10 text_over">
                                <span class="color_555 fw_600">종료일</span>
                                ${x.endDate}
                            </div>
                            <div class="flex flex_e">
                                <div class="view_btn ${new Date() < new Date(x.endDate) ? 'on' : ''}" data-num="${x.number}">${new Date() < new Date(x.endDate) ? '투자하기' : '모집완료'}</div>
                            </div>
                            <div class="bar m_t_20"></div>
                        </div>
        `
    }

    loadInvestor() {
        let page = this.$tbody.data("page");
        log(page)
        this.$tbody.fadeOut(500);
        setTimeout(() => {
            const ITEM_COUNT = 5;
            const BTN_COUNT = 5;

            let total_page = Math.ceil(this.investor_list.length / ITEM_COUNT);
            total_page = total_page <= 0 ? 1 : total_page;
            let current_block = Math.ceil(page / BTN_COUNT);

            let start = current_block * BTN_COUNT - BTN_COUNT + 1;
            start = start < 1 ? 1 : start;
            let end = start + BTN_COUNT - 1;
            end = end >= total_page ? total_page : end;

            let prev = start > 1;
            let next = end < total_page;
            let start_idx = (page - 1) * ITEM_COUNT;
            let end_idx = start_idx + ITEM_COUNT;

            let view_list = this.investor_list.slice(start_idx, end_idx);
            let htmlBtns = ` <div class="num ${prev ? '' : 'disable'}" data-page='${prev ? start - 1 : 'no'}'><i class="fas fa-chevron-left"></i></div>`;
            for (let i = start; i <= end; i++) {
                htmlBtns += `   <div class="num ${page == i ? 'active' : ''}" data-page="${i}">${i}</div>`;
            }
            htmlBtns += `<div class="num  ${next ? '' : 'disable'}" data-page='${next ? end + 1 : 'no'}'><i class="fas fa-chevron-right"></i></div>`;
            $('.investor_pagination_group').html(htmlBtns);

            this.$tbody.empty();
            view_list.forEach(x => {
                let dom = this.makeInvestorDom(x);
                this.$tbody.append(dom);
            });
            view_list.forEach((item, idx) => {
                setTimeout(() => {
                    this.$tbody.find("tr").eq(idx).find(".graph").animate({ "width": item.percent >= 100 ? 100 + '%' : item.percent + '%' }, 2000);
                }, 300);
            });
            this.$tbody.fadeIn();
        }, 500);
    }
    makeInvestorDom(x) {
        return `
                        <tr>
                            <td class="text_over color_333 fw_500" title="${x.number}">${x.number}</td>
                            <td class="text_over color_333 fw_500" title="${x.xss_name}">${x.xss_name}</td>
                            <td class="text_over color_333 fw_500" title="${x.xss_user}">${x.xss_user}</td>
                            <td class="text_over color_333 fw_500" title="${x.str_money}원">${x.str_money}원</td>
                            <td class="text_over color_333 fw_500" title="${x.percent}%">${x.percent}%
                            <div class="graph"></div></td>
                            <td class="text_over color_333 fw_500">
                                <div class="in_btn" data-num="${x.number}" data-user="${x.xss_user}">투자펀드계약서</div>
                            </td>
                        </tr>
        `

    }


    getRandomText() {
        let r = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
        let n = Math.ceil(Math.random() * 10000).toString().padStart(4, "0");
        return r + n;
    }


    setMainEvent() {
        this.visualAnimation();
        $(document).on("click", "header .nav > div", (e) => {
            let idx = e.currentTarget.dataset.idx;
            if (this.is_moveing) return;
            this.is_moveing = true;

            $('header .nav > div').removeClass("on");
            $('header .nav > div').eq(idx).addClass("on");

            this.movePage(idx);
        });
    }


    setFundRegisterEvent() {
        $(document).on("input", ".reg_fund_money", (e) => {
            let value = e.currentTarget.value;
            value = (value.replaceAll(/[^0-9]/g, "") * 1).toLocaleString();
            e.currentTarget.value = value;
        });

        $(document).on("click", ".reg_btn", () => {
            let num = $('.reg_fund_num').html().trim();
            let name = $('.reg_fund_name').val().trim();
            let end = $('.reg_fund_end').val().trim();
            let money = $('.reg_fund_money').val().trim();

            if (num == "" || name == "" || end == "" || money == "" || money <= 0) {
                alert("값이 잘못되었거나 비어있습니다.");
                return;
            }
            end = end.replaceAll("T", " ");

            let obj = {
                current: 0,
                endDate: end,
                xss_name: this.xss(name),
                name: name,
                number: num,
                total: this.removeComma(money),
                str_current: 0,
                str_total: money,
                percent: this.getPercent(this.removeComma(money), 0)
            }
            this.datas.push(obj);
            this.loadFundRegister();

            log(this.datas);
        });
    }
    removeComma(str) {
        return str.split(',').join('') * 1;
    }

    setFundViewEvent() {
        $(document).on("click", ".view_pagination_group > .num", (e) => {
            let page = e.currentTarget.dataset.page;
            if (page == 'no') return;
            this.$item_list.data('page', page);
            this.loadFundView();
        });
        this.$item_list.on("click", ".on", (e) => {
            let fund = this.datas.find(x => x.number == e.currentTarget.dataset.num);
            this.$popup.find("input").val("");
            this.draing_ok = false;
            this.$ctx.clearRect(0, 0, this.$canvas.width, this.$canvas.height);
            this.$popup.find(".popup_fund_num").html(fund.number);
            this.$popup.find('.popup_fund_name').val(fund.name);
            this.$popup.find(".popup_fund_money").data("max", fund.total);
            this.$popup.fadeIn();
        });

        $(this.$popup).on("click", ".close", () => {
            this.$popup.fadeOut();
        });

        $(this.$canvas).on('mousedown', (e) => {
            let x = e.offsetX;
            let y = e.offsetY;
            this.is_drawing = true;
            this.prex = x;
            this.prey = y;
        });

        $(this.$canvas).on("mousemove", (e) => {
            if (!this.is_drawing) return;
            this.draing_ok = true;
            let x = e.offsetX;
            let y = e.offsetY;
            this.$ctx.beginPath();
            this.$ctx.moveTo(this.prex, this.prey);
            this.$ctx.lineTo(x, y);
            this.$ctx.closePath();
            this.$ctx.stroke();

            this.prex = x;
            this.prey = y;
        });
        $(this.$canvas).on("mouseup", () => { this.is_drawing = false });
        $(this.$canvas).on("mouseover", (e) => {
            let x = e.offsetX;
            let y = e.offsetY;
            this.prex = x;
            this.prey = y;
        });

        this.$popup.on("click", ".popup_btn", (e) => {
            let num = $('.popup_fund_num').html().trim();
            let name = $('.popup_fund_name').val().trim();
            let user = $('.popup_fund_user').val().trim();
            let money = $('.popup_fund_money').val().trim();
            let url = this.$canvas.toDataURL();

            this.$popup.find("input").val("");
            if (num == "" || name == "" || user == "" || money == "" || money <= 0 || !this.draing_ok) {
                alert("값이 잘못되었거나 비어있습니다.");
                return;
            }
            money = this.removeComma(money);
            let fund = this.datas.find(x => x.number == num);
            fund.current = fund.current + (money * 1);
            fund.str_current = fund.current.toLocaleString();
            fund.percent = this.getPercent(fund.total, fund.current);

            let find_user = this.investor_list.find(x => x.number == num && x.user == user);
            log(find_user);
            if (find_user == undefined) {
                let obj = {
                    number: num,
                    name: name,
                    xss_name: this.xss(name),
                    user: user,
                    xss_user: this.xss(user),
                    money: money,
                    str_money: money.toLocaleString(),
                    percent: this.getPercent(fund.total, money),
                    url: url
                }
                this.investor_list.unshift(obj);
            } else {
                find_user.url = url;
                find_user.money = (find_user.money * 1) + (money * 1);
                find_user.str_money = find_user.money.toLocaleString();
                find_user.percent = this.getPercent(fund.total, find_user.money);

            }
            this.$popup.fadeOut();
            this.loadFundView();
            log(this.investor_list);

        });

        this.$popup.on("input", ".popup_fund_money", (e) => {
            let max = $(e.currentTarget).data('max');
            let value = e.currentTarget.value;
            log(this.removeComma(value));
            if (max <= this.removeComma(value)) value = max;
            value = (value.toString().replaceAll(/[^0-9]/g, "") * 1).toLocaleString();
            e.currentTarget.value = value;

        });

    }

    setInvestorListEvent() {
        $('.investor_pagination_group').on("click", ".num", (e) => {
            let page = e.currentTarget.dataset.page;
            if (page == 'no') return;
            this.$tbody.data('page', page);
            this.loadInvestor();
        });
        $(document).on("click", ".in_btn", (e) => {
            let num = e.currentTarget.dataset.num;
            let user = e.currentTarget.dataset.user;
            let data = this.investor_list.find(x => x.number == num && x.xss_user == user);
            let sign = new Image();
            sign.src = data.url;
            sign.addEventListener('load', () => {
                let funding_img = new Image();
                funding_img.src = '/images/funding.png';
                funding_img.addEventListener('load', () => {
                    let c = document.createElement('canvas');
                    c.width = 793
                    c.height = 495;
                    let ctx = c.getContext('2d');
                    ctx.fillStyle = "13px noto";
                    ctx.drawImage(funding_img, 0, 0);
                    ctx.drawImage(sign, 455, 350, 250, 110);
                    ctx.fillText(data.number, 350, 170);
                    ctx.fillText(data.name, 350, 220);
                    ctx.fillText(data.user, 350, 270);
                    ctx.fillText(data.str_money, 350, 320);
                    let a = document.createElement('a');
                    let url = c.toDataURL();
                    log(c, sign, funding_img);
                    a.href = url;
                    a.download = "";
                    a.click();
                });
            });


        })
    }

    movePage(next_idx) {
        let top = this.$now_page.height();
        let now_idx = this.$now_page.data('idx');
        let next_page = $('.main_container .section').eq(next_idx);
        if (next_idx != now_idx) {
            next_page.css('top', top + "px").show().animate({ "top": 0 }, 800);
            this.$now_page.animate({ "top": -top + "px" }, 800).fadeOut(1);
            setTimeout(() => {
                this.is_moveing = false;
                this.$now_page = next_page;
                this.$now_page.data('idx', next_idx);
            }, 1002);
            if (next_idx == 0) this.loadMain();
            else if (next_idx == 1) this.loadFundRegister();
            else if (next_idx == 2) this.loadFundView();
            else if (next_idx == 3) this.loadInvestor();
        } else {
            this.is_moveing = false;
        }
    }



    sortData() {
        this.datas.sort((a, b) => {
            return a.percent < b.percent ? 1 : a.percent > b.percent ? -1 : 0;
        });
    }

    getDatas() {
        return this.json.map(x => {
            return {
                current: x.current,
                endDate: x.endDate,
                xss_name: this.JSONxss(x.name),
                name: x.name,
                number: x.number,
                total: x.total,
                str_current: x.current.toLocaleString(),
                str_total: x.total.toLocaleString(),
                percent: this.getPercent(x.total, x.current)
            }
        });
    }

    getPercent(total, current) {
        return Math.ceil((current / total * 100) * 100) / 100;
    }

    getJSON() {
        return $.ajax('/js/fund.json');
    }


    visualAnimation() {
        setInterval(() => {
            if (this.is_visual) {
                $(".main .visual > img").eq(1).fadeOut(1000);
                this.is_visual = false;
            } else {
                $(".main .visual > img").eq(1).fadeIn(1000);
                this.is_visual = true;
            }
        }, 5000);
    }

    xss(str) {
        let arr = [
            ["&", "&amp;"],
            ["<", "&lt;"],
            [">", "&gt;"],
            ["\n", "\\n"],
            ["'", "&#39;"],
            ['"', "&quot;"]
        ];
        arr.forEach(x => {
            str = str.replaceAll(x[0], x[1]);
        });
        return str;
    }

    JSONxss(str) {
        let arr = [
            ["&", "&amp;"],
            ["<", "&lt;"],
            [">", "&gt;"],
            ["\n", "<br>"],
            ["'", "&#39;"],
            ['"', "&quot;"]
        ];
        arr.forEach(x => {
            str = str.replaceAll(x[0], x[1]);
        });
        return str;
    }
}

