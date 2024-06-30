import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

/**
 * @description controller to log the ip address of the client
 * @param req Request
 * @param res Response
 * @returns void
 * @example logIpAddress(req, res);
 * @since 1.0.0
 * @version 1.0.0
 * @access public
 * @alias logIpAddress
 */

class TaskController {
  private clientIp: string | string[] | null;
  private geoLocationUrl: string;

  constructor() {
    this.clientIp = "";
    this.geoLocationUrl = "";
    this.logIpAddress = this.logIpAddress.bind(this);
  }

  public async logIpAddress(req: Request, res: Response): Promise<any> {
    const { visitor_name } = req.query as { visitor_name: string };
    const capitalizeName = visitor_name.charAt(0).toUpperCase() + visitor_name.substring(1);

    this.clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown IP";

    if (Array.isArray(this.clientIp)) {
      this.clientIp = this.clientIp[0];
    }

    this.geoLocationUrl = `https://ipinfo.io/${this.clientIp}/geo`;

    try {
      const response = await axios.get(this.geoLocationUrl);
      const geoLocation = await response.data;
      const { city, region, country } = geoLocation;

      const weather_response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env["OPEN_WEATHER_MAP_API"]}`
      );

      if (weather_response.status !== 200) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "Weather data fetch failed",
        });
      }

      const weather_data = weather_response.data;
      weather_data.main.temp = Math.round(weather_data.main.temp - 273.15);

      const temperature = weather_data.main.temp;

      return res.status(StatusCodes.OK).json({
        client_ip: `You're requesting for this resource from IP address: ${this.clientIp}`,
        location: city,
        region: region,
        country: country,
        greeting: `Hello, ${capitalizeName}!, the temperature is ${temperature} degrees Celsius in ${city}`,
      });
    } catch (error: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: error.message,
      });
    }
  }
}

export const taskController = new TaskController();
